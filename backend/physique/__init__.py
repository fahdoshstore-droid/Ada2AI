"""
Ada2Physique — AI Bodybuilding Intelligence Platform (backend service).

Isolated FastAPI module living inside the Ada2AI backend. Reuses Ada2AI shared
infrastructure (Supabase, ai-provider pattern, vision_core) while keeping all
bodybuilding logic namespaced under ``physique``.

Public entry points:
    from backend.physique.api import router      # include into an existing FastAPI app
    from backend.physique.app import app         # run standalone (Cloud Run / Docker)
"""
__version__ = "1.0.0"
