# AXIS Sign-in, Registration, and One-Click Return Access Proposal

Date: 2026-09-29
Status: Proposal only — implementation has not started

## Current state

The backend currently authenticates with deployment-level API keys:

- `AXIS_API_KEY_READONLY`
- `AXIS_API_KEY_OPERATOR`
- `AXIS_API_KEY_ADMIN`

The frontend can send an API key through `VITE_AXIS_API_KEY`, but there is currently no user account, registration, password, session, refresh-token, or password-reset system.

## Important security decision

The requested email/password values must not be stored as plaintext, in `localStorage`, in `sessionStorage`, or in frontend source code. The frontend should never retain or receive a user's password after registration or login.

The safe equivalent of “auto sign in next time with one button” is:

1. The user registers or signs in once.
2. The backend hashes the password and stores only the password hash.
3. The backend creates a rotating session/refresh token.
4. The token is stored in a `Secure`, `HttpOnly`, `SameSite` cookie.
5. On the next visit, the frontend calls `/api/auth/me`.
6. If the cookie is still valid, the UI shows `Continue as <email>` or signs in automatically according to the user's choice.

The browser may store the user's email and a non-sensitive display preference, but not the password or an API/admin credential.

## Proposed backend design

### Database tables

Add an Alembic migration for:

- `users`: id, email, normalized email, password hash, role, status, created_at, updated_at, last_login_at
- `user_sessions`: id, user_id, hashed refresh token, expires_at, revoked_at, created_at, last_used_at, user-agent metadata
- optionally `email_verification_tokens` and `password_reset_tokens`, storing only hashed token values with expiry

Email should have a unique normalized index. Password hashes should use Argon2id or bcrypt with a documented cost configuration.

### Routes

Add public routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/complete`

The existing API-key gateway should continue supporting service-to-service access. User sessions should be a separate authentication method that resolves to the same scoped authorization layer.

### Required protections

- generic login/register errors to avoid account enumeration;
- strict validation and normalization of email addresses;
- rate limits on register, login, refresh, and password reset;
- constant-time credential checks;
- session rotation after login and refresh;
- immediate session revocation on logout;
- secure cookie flags in production;
- CSRF protection for cookie-authenticated state-changing requests;
- audit events for registration, login success/failure, refresh, logout, and password changes;
- no passwords, raw tokens, or API keys in logs;
- HTTPS requirement outside local development.

## Proposed frontend design

Add:

- a sign-in modal/page;
- a registration modal/page;
- a `Continue as <email>` button when `/api/auth/me` finds a valid session;
- logout and account status controls in the top bar/settings area;
- loading, invalid-credential, expired-session, and backend-unavailable states;
- a clear distinction between user authentication and `LIVE DATA` feed status.

The frontend should use `credentials: 'include'` for authentication requests. It should not put passwords or session tokens into local storage.

## Interaction with current API-key setup

The current read-only API key is a machine/deployment credential, not a user password. It should not be repurposed as a user account credential.

After user authentication is implemented, the authorization layer can map users to read-only/operator scopes. Existing API-key access should remain available for internal services and controlled local development.

For production, the frontend should stop embedding a shared read-only API key in a browser bundle once user sessions are available. A shared browser-visible API key can be extracted by any user who can inspect the frontend.

## Rollout and migration plan

1. Add password hashing and account/session models.
2. Add database migration and repository methods.
3. Add auth routes and tests before changing protected incident routes.
4. Add cookie/session authentication to the gateway.
5. Add frontend auth state and views.
6. Add end-to-end tests for registration, login, refresh, logout, expiry, and protected incident access.
7. Keep the demo fallback independent: backend outage may still show clearly labelled demo data, but it must never fabricate a successful user login.
8. Deploy with API keys and session secrets supplied through the deployment secret manager, not committed files.

## Approval boundary

No authentication code, database migration, password storage, or frontend auth UI has been changed in this proposal. Implementation should begin only after approval of:

- cookie-based session authentication;
- server-side password hashing;
- no plaintext password storage;
- whether email verification is required before operational access;
- the initial role model (for example, read-only user versus operator).

