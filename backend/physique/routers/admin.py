"""Admin platform analytics (service-role aggregations)."""
from __future__ import annotations
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from ..deps import AuthUser, require_admin
from ..schemas import AdminStatsResponse
from ..supabase_service import get_service_client

router = APIRouter()


def _count(client, table: str, **filters) -> int:
    q = client.table(table).select("*", count="exact").limit(1)
    for k, v in filters.items():
        q = q.eq(k, v)
    res = q.execute()
    return res.count or 0


@router.get("/admin/stats", response_model=AdminStatsResponse)
def admin_stats(user: AuthUser = Depends(require_admin)) -> AdminStatsResponse:
    client = get_service_client()
    since = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    return AdminStatsResponse(
        athletes=_count(client, "physique_athletes", is_active=True),
        coaches=_count(client, "physique_coaches"),
        active_assignments=_count(client, "physique_assignments", is_active=True),
        programs=_count(client, "physique_programs"),
        nutrition_plans=_count(client, "physique_nutrition_plans"),
        check_ins_30d=client.table("physique_check_ins").select("*", count="exact").gte("created_at", since).limit(1).execute().count or 0,
        ai_reports_30d=client.table("physique_ai_reports").select("*", count="exact").gte("created_at", since).limit(1).execute().count or 0,
    )
