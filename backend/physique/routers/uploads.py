"""Signed upload URLs for private physique storage buckets (videos/photos)."""
from __future__ import annotations
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..deps import AuthUser, get_current_user
from ..schemas import SignUploadRequest, SignUploadResponse, SignedUrlRequest, SignedUrlResponse
from ..supabase_service import get_service_client, is_assigned_coach

router = APIRouter()

ALLOWED_BUCKETS = {"physique-videos", "physique-photos"}


@router.post("/uploads/sign", response_model=SignUploadResponse)
def sign_upload(req: SignUploadRequest, user: AuthUser = Depends(get_current_user)) -> SignUploadResponse:
    if req.bucket not in ALLOWED_BUCKETS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Bucket must be one of {ALLOWED_BUCKETS}")
    # Path layout: <uid>/[<label>-]<uuid>.<ext>  → matches storage RLS (first folder = auth.uid())
    label = (req.label or "").strip().lower().replace("/", "").replace(" ", "_")
    suffix = f"{uuid.uuid4().hex}.{req.ext.lstrip('.')}"
    path = f"{user.uid}/{label}-{suffix}" if label else f"{user.uid}/{suffix}"
    client = get_service_client()
    try:
        res = client.storage.from_(req.bucket).create_signed_upload_url(path)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Storage error: {exc}")
    signed_url = res.get("signed_url") or res.get("signedURL") or ""
    return SignUploadResponse(path=path, signed_url=signed_url, expires_in=3600)


@router.post("/uploads/signed-url", response_model=SignedUrlResponse)
def get_signed_url(req: SignedUrlRequest, user: AuthUser = Depends(get_current_user)) -> SignedUrlResponse:
    """Issue a short-lived download URL for a private storage object.

    The physique-photos bucket is owner-only via storage RLS, so a coach needs a
    server-issued signed URL to view an assigned athlete's check-in photos.
    Authorization mirrors the DB RLS: athletes may read only their own paths
    (first folder == user.uid); coaches may read paths belonging to an athlete
    they are actively assigned to; admins may read any path.
    """
    if req.bucket not in ALLOWED_BUCKETS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Bucket must be one of {ALLOWED_BUCKETS}")
    if not req.path or "/" not in req.path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid object path")

    owner_uid = req.path.split("/", 1)[0]

    if user.role == "athlete":
        if owner_uid != user.uid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your file")
    elif user.role == "coach":
        if not is_assigned_coach(user.uid, owner_uid):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to this athlete")
    elif user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    client = get_service_client()
    try:
        res = client.storage.from_(req.bucket).create_signed_url(req.path, 3600)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Storage error: {exc}")
    signed_url = res.get("signed_url") or res.get("signedURL") or ""
    if not signed_url:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Could not create signed URL")
    return SignedUrlResponse(signed_url=signed_url, expires_in=3600)
