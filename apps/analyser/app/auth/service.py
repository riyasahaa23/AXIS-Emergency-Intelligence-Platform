"""User registration and secure cookie-session management."""
from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

from app.auth.gateway import AuthContext


class AuthService:
    """Password-authenticated users backed by PostgreSQL or local dev memory."""

    session_days = 30

    def __init__(self, database_engine=None) -> None:
        self.database_engine = database_engine
        self.users: dict[str, dict[str, Any]] = {}
        self.sessions: dict[str, dict[str, Any]] = {}

    @staticmethod
    def normalize_email(email: str) -> str:
        return email.strip().lower()

    @staticmethod
    def hash_password(password: str) -> str:
        salt = secrets.token_bytes(16)
        digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
        return "scrypt$16384$8$1$" + _b64(salt) + "$" + _b64(digest)

    @staticmethod
    def verify_password(password: str, encoded: str) -> bool:
        try:
            algorithm, n, r, p, salt, expected = encoded.split("$", 5)
            if algorithm != "scrypt":
                return False
            actual = hashlib.scrypt(
                password.encode(), salt=_unb64(salt), n=int(n), r=int(r), p=int(p)
            )
            return hmac.compare_digest(actual, _unb64(expected))
        except (ValueError, TypeError):
            return False

    async def register(self, email: str, password: str) -> dict[str, str]:
        normalized = self.normalize_email(email)
        if not normalized or "@" not in normalized or len(normalized) > 320:
            raise ValueError("Enter a valid email address")
        if len(password) < 8 or len(password) > 128:
            raise ValueError("Password must be between 8 and 128 characters")
        if await self._find_user(normalized):
            raise ValueError("Unable to create account with these details")

        user_id = f"USR-{uuid4().hex[:12].upper()}"
        password_hash = self.hash_password(password)
        now = datetime.now(UTC)
        user = {"id": user_id, "email": normalized, "role": "user", "password_hash": password_hash, "created_at": now}
        if self.database_engine is None:
            self.users[normalized] = user
        else:
            from sqlalchemy import text

            async with self.database_engine.begin() as connection:
                await connection.execute(text("""
                    INSERT INTO users (id, email, password_hash, role, status, created_at, updated_at)
                    VALUES (:id, :email, :password_hash, :role, 'active', :created_at, :updated_at)
                """), {**user, "updated_at": now})
        return {"id": user_id, "email": normalized, "role": "user"}

    async def login(self, email: str, password: str) -> tuple[dict[str, str], str]:
        normalized = self.normalize_email(email)
        user = await self._find_user(normalized)
        if not user or not self.verify_password(password, user["password_hash"]):
            raise ValueError("Invalid email or password")
        token = secrets.token_urlsafe(48)
        session_id = f"SES-{uuid4().hex[:12].upper()}"
        expires_at = datetime.now(UTC) + timedelta(days=self.session_days)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        if self.database_engine is None:
            self.sessions[token_hash] = {"id": session_id, "user_id": user["id"], "expires_at": expires_at}
        else:
            from sqlalchemy import text

            async with self.database_engine.begin() as connection:
                await connection.execute(text("""
                    INSERT INTO user_sessions (id, user_id, token_hash, expires_at, created_at, last_used_at)
                    VALUES (:id, :user_id, :token_hash, :expires_at, :created_at, :last_used_at)
                """), {"id": session_id, "user_id": user["id"], "token_hash": token_hash, "expires_at": expires_at, "created_at": datetime.now(UTC), "last_used_at": datetime.now(UTC)})
        return {"id": user["id"], "email": user["email"], "role": user.get("role", "user")}, token

    async def authenticate(self, token: str | None) -> AuthContext | None:
        if not token:
            return None
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        if self.database_engine is None:
            session = self.sessions.get(token_hash)
            if not session or session["expires_at"] <= datetime.now(UTC):
                return None
            user_id = session["user_id"]
            user = next((item for item in self.users.values() if item["id"] == user_id), None)
            if not user:
                return None
            return AuthContext(user_id, frozenset({"read", "analyse", "simulate", "recommend"}), "session")

        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            row = (await connection.execute(text("""
                SELECT u.id, u.status
                FROM user_sessions s JOIN users u ON u.id = s.user_id
                WHERE s.token_hash=:token_hash AND s.revoked_at IS NULL AND s.expires_at > now() AND u.status='active'
            """), {"token_hash": token_hash})).mappings().first()
            if not row:
                return None
            await connection.execute(text("UPDATE user_sessions SET last_used_at=now() WHERE token_hash=:token_hash"), {"token_hash": token_hash})
        return AuthContext(row["id"], frozenset({"read", "analyse", "simulate", "recommend"}), "session")

    async def user_for_context(self, context: AuthContext | None) -> dict[str, str] | None:
        if context is None:
            return None
        if self.database_engine is None:
            user = next((item for item in self.users.values() if item["id"] == context.subject), None)
            return _public_user(user) if user else None
        from sqlalchemy import text

        async with self.database_engine.connect() as connection:
            row = (await connection.execute(text("SELECT id, email, role FROM users WHERE id=:id AND status='active'"), {"id": context.subject})).mappings().first()
        return dict(row) if row else None

    async def logout(self, token: str | None) -> None:
        if not token:
            return
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        if self.database_engine is None:
            self.sessions.pop(token_hash, None)
            return
        from sqlalchemy import text

        async with self.database_engine.begin() as connection:
            await connection.execute(text("UPDATE user_sessions SET revoked_at=now() WHERE token_hash=:token_hash"), {"token_hash": token_hash})

    async def _find_user(self, email: str) -> dict[str, Any] | None:
        if self.database_engine is None:
            return self.users.get(email)
        from sqlalchemy import text

        async with self.database_engine.connect() as connection:
            row = (await connection.execute(text("SELECT id, email, password_hash, role FROM users WHERE email=:email AND status='active'"), {"email": email})).mappings().first()
        return dict(row) if row else None


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode().rstrip("=")


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def _public_user(user: dict[str, Any] | None) -> dict[str, str] | None:
    if not user:
        return None
    return {"id": user["id"], "email": user["email"], "role": user.get("role", "user")}
