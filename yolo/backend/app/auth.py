from __future__ import annotations

import os
from fastapi import Header, HTTPException


ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "").strip()


def require_admin(x_admin_key: str | None = Header(default=None)) -> None:
    """
    Admin-only access guard.

    If ADMIN_API_KEY is set, clients must send:
      X-Admin-Key: <ADMIN_API_KEY>
    """
    if not ADMIN_API_KEY:
        # Allow open access in dev if no key is configured.
        return

    if not x_admin_key or x_admin_key.strip() != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized (admin key required)")

