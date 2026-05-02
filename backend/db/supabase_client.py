"""
Supabase Client for Ada2AI Backend
"""
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ujjmhqpyehymaavkawiv.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"[Supabase] Connected to {SUPABASE_URL}")
except Exception as e:
    print(f"[Supabase] Connection failed: {e}")
    supabase = None
