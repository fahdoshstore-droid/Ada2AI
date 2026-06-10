"""
Supabase Client for Ada2AI Backend — NO hardcoded credentials.
"""
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[Supabase] WARNING: SUPABASE_URL or SUPABASE_ANON_KEY not set. Client disabled.")
    supabase = None
else:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"[Supabase] Connected to {SUPABASE_URL}")
    except Exception as e:
        print(f"[Supabase] Connection failed: {e}")
        supabase = None
