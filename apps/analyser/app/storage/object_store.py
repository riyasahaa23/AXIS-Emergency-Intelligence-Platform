from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Protocol


class ObjectStore(Protocol):
    async def put(self, key: str, content: bytes, content_type: str = "application/octet-stream") -> str: ...


class LocalObjectStore:
    def __init__(self, root: str) -> None:
        self.root = Path(root)

    async def put(self, key: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        target = self.root / key
        target.parent.mkdir(parents=True, exist_ok=True)
        await asyncio.to_thread(target.write_bytes, content)
        return str(target)


class S3ObjectStore:
    def __init__(self, bucket: str, endpoint: str = "", region: str = "us-east-1", access_key: str = "", secret_key: str = "") -> None:
        self.bucket = bucket
        self.endpoint = endpoint or None
        self.region = region
        self.access_key = access_key or None
        self.secret_key = secret_key or None

    async def put(self, key: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        try:
            import boto3
        except ImportError as exc:
            raise RuntimeError("Install the storage extra to use S3-compatible object storage") from exc

        def upload() -> str:
            client = boto3.client(
                "s3", endpoint_url=self.endpoint, region_name=self.region,
                aws_access_key_id=self.access_key, aws_secret_access_key=self.secret_key,
            )
            client.put_object(Bucket=self.bucket, Key=key, Body=content, ContentType=content_type)
            return f"s3://{self.bucket}/{key}"

        return await asyncio.to_thread(upload)
