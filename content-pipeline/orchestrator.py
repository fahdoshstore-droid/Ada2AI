#!/usr/bin/env python3
"""
Ada2AI Content Pipeline — Orchestrator
Generates viral sports content using AI + RedditVideoMakerBot

Flow:
  Task → Content Strategy (AI) → RedditVideoMakerBot → Post-Processing (AI) → Store

Usage:
  python orchestrator.py --topic "best football players" --subreddit soccer
  python orchestrator.py --auto  # picks trending topic via AI
"""

import json
import os
import subprocess
import sys
import argparse
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

# ─── Config ───────────────────────────────────────────
PIPELINE_DIR = Path(__file__).parent
ADA2AI_DIR = PIPELINE_DIR.parent
REDDIT_BOT_DIR = Path.home() / "RedditVideoMakerBot"
OUTPUT_DIR = PIPELINE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:14b")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# ─── AI Provider (Anthropic → Ollama fallback) ─────────
def ai_call(prompt: str, max_tokens: int = 500) -> str:
    """Call AI: Anthropic if key available, else Ollama."""
    
    if ANTHROPIC_KEY and len(ANTHROPIC_KEY) > 10:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=ANTHROPIC_KEY)
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        except Exception as e:
            print(f"⚠️  Anthropic failed: {e}, falling back to Ollama")
    
    # Fallback: Ollama
    payload = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": max_tokens}
    }).encode()
    
    try:
        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
            return data.get("response", "")
    except urllib.error.URLError as e:
        print(f"❌ Ollama not running: {e}")
        print("   Start with: ollama serve")
        sys.exit(1)

def extract_json(text: str) -> dict:
    """Extract JSON from AI response."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            try:
                return json.loads(text[start:end])
            except:
                pass
        # Try after ```json block
        if "```json" in text:
            block = text.split("```json")[1].split("```")[0]
            return json.loads(block.strip())
        raise ValueError(f"Cannot extract JSON from: {text[:200]}")


# ─── Step 1: Content Strategy (AI) ────────────────────
def run_content_strategy(topic: str, subreddit: str = None, tone: str = "engaging") -> dict:
    """Use AI to generate content strategy."""
    
    prompt = f"""You are a sports content expert. Create a viral video strategy for:

Topic: {topic}
Subreddit: {subreddit or "auto-detect"}
Tone: {tone}

Respond with JSON only:
{{
  "subreddit": "best subreddit name",
  "thread_type": "askreddit",
  "search_query": "Reddit search keywords",
  "angle": "content angle/hook",
  "hook": "opening line in Arabic",
  "title_template": "video title in Arabic",
  "tags": ["hashtag1", "hashtag2"],
  "platform": "tiktok",
  "duration_target": 45,
  "tts_language": "ar"
}}"""

    response = ai_call(prompt)
    strategy = extract_json(response)
    
    # Save strategy
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    strategy_file = OUTPUT_DIR / f"strategy_{timestamp}.json"
    strategy_file.write_text(json.dumps(strategy, ensure_ascii=False, indent=2))
    
    print(f"✅ Content strategy generated")
    print(f"   Subreddit: r/{strategy.get('subreddit', '?')}")
    print(f"   Angle: {strategy.get('angle', '?')}")
    print(f"   Hook: {strategy.get('hook', '?')}")
    
    return strategy


# ─── Step 2: Execute RedditVideoMakerBot ──────────────
def run_reddit_bot(strategy: dict) -> Path | None:
    """Configure and run RedditVideoMakerBot based on strategy."""
    config_path = REDDIT_BOT_DIR / "config.toml"
    
    import toml
    if config_path.exists():
        config = toml.load(config_path)
    else:
        config = {}
    
    # Override config
    config.setdefault("reddit", {}).setdefault("thread", {})
    config["reddit"]["thread"]["subreddit"] = strategy.get("subreddit", "soccer")
    config["reddit"]["thread"]["postlimit"] = 1
    
    config.setdefault("settings", {})
    config["settings"]["tts"] = "gtts"
    config["settings"]["background"] = {
        "background_video": "minecraft",
        "background_audio": "none"
    }
    
    with open(config_path, "w") as f:
        toml.dump(config, f)
    
    print(f"\n🎬 Running RedditVideoMakerBot for r/{strategy.get('subreddit')}...")
    
    venv_python = REDDIT_BOT_DIR / "venv" / "bin" / "python"
    
    try:
        result = subprocess.run(
            [str(venv_python), "main.py"],
            cwd=str(REDDIT_BOT_DIR),
            capture_output=True, text=True, timeout=300,
            env={**os.environ, "VIRTUAL_ENV": str(REDDIT_BOT_DIR / "venv")}
        )
        
        # Find output
        for search_dir in [REDDIT_BOT_DIR / "assets" / "temp", REDDIT_BOT_DIR / "results"]:
            if search_dir.exists():
                videos = sorted(search_dir.glob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
                if videos:
                    import shutil
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    final_path = OUTPUT_DIR / f"raw_{timestamp}.mp4"
                    shutil.copy2(videos[0], final_path)
                    print(f"✅ Video generated: {final_path}")
                    return final_path
        
        print(f"⚠️  No video. Output: {result.stdout[-300:]}")
        return None
        
    except subprocess.TimeoutExpired:
        print("❌ Bot timed out")
        return None
    except Exception as e:
        print(f"❌ Bot failed: {e}")
        return None


# ─── Step 3: Post-Processing ──────────────────────────
def run_post_processing(video_path: Path, strategy: dict) -> dict:
    """AI-powered post-processing: metadata, captions, thumbnail."""
    
    print(f"\n🎨 Post-processing: {video_path.name}")
    
    prompt = f"""You are a sports content marketing expert. Generate metadata for this video:

Topic: {strategy.get('angle', 'sports')}
Hook: {strategy.get('hook', '')}
Platform: {strategy.get('platform', 'tiktok')}

JSON only:
{{
  "title": "catchy Arabic title (under 60 chars)",
  "description": "Arabic description (2-3 lines)",
  "tags": ["arabic_hashtag", "english_hashtag"],
  "thumbnail_text": "thumbnail text (3-5 words)",
  "caption_ar": "Arabic caption summary",
  "cta": "call-to-action phrase"
}}"""

    response = ai_call(prompt)
    metadata = extract_json(response)
    
    # FFmpeg text overlay
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    final_path = OUTPUT_DIR / f"final_{timestamp}.mp4"
    
    thumb_text = metadata.get("thumbnail_text", "")
    font_file = "/System/Library/Fonts/Supplemental/Arial.ttf"
    if not Path(font_file).exists():
        font_file = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    
    if thumb_text and Path(font_file).exists():
        cmd = [
            "ffmpeg", "-y", "-i", str(video_path),
            "-vf", f"drawtext=text='{thumb_text}':fontfile={font_file}:fontsize=36:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=h-80",
            "-c:a", "copy", str(final_path)
        ]
        try:
            subprocess.run(cmd, capture_output=True, timeout=60)
            print(f"✅ Text overlay added")
        except:
            import shutil; shutil.copy2(video_path, final_path)
    else:
        import shutil; shutil.copy2(video_path, final_path)
    
    # Save metadata
    meta_path = OUTPUT_DIR / f"metadata_{timestamp}.json"
    meta_data = {**metadata, "video_file": str(final_path), "strategy": strategy, "generated_at": timestamp}
    meta_path.write_text(json.dumps(meta_data, ensure_ascii=False, indent=2))
    
    print(f"✅ Metadata saved")
    return meta_data


# ─── Step 4: Store in Supabase ────────────────────────
def store_content(metadata: dict) -> bool:
    """Store generated content in Supabase."""
    try:
        url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
        if not url or not key:
            print("⚠️  Supabase not configured")
            return False
        
        from supabase import create_client
        supabase = create_client(url, key)
        supabase.table("content").insert({
            "title": metadata.get("title", ""),
            "description": metadata.get("description", ""),
            "tags": metadata.get("tags", []),
            "video_path": metadata.get("video_file", ""),
            "platform": metadata.get("strategy", {}).get("platform", "tiktok"),
            "status": "ready",
        }).execute()
        print("✅ Stored in Supabase")
        return True
    except Exception as e:
        print(f"⚠️  Supabase store failed: {e}")
        return False


# ─── Main ──────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Ada2AI Content Pipeline")
    parser.add_argument("--topic", type=str, help="Content topic")
    parser.add_argument("--subreddit", type=str, default=None)
    parser.add_argument("--auto", action="store_true", help="Auto-pick trending topic")
    parser.add_argument("--tone", type=str, default="engaging")
    parser.add_argument("--skip-bot", action="store_true", help="Skip RedditVideoMakerBot")
    args = parser.parse_args()
    
    print("🚀 Ada2AI Content Pipeline")
    print("=" * 50)
    
    if args.auto and not args.topic:
        args.topic = "best football moments 2025"
        args.subreddit = "soccer"
    
    if not args.topic:
        print("❌ Specify --topic or use --auto")
        sys.exit(1)
    
    # Step 1
    print(f"\n📋 Step 1: Content Strategy")
    strategy = run_content_strategy(args.topic, args.subreddit, args.tone)
    
    # Step 2
    if args.skip_bot:
        print("\n⏭️  Step 2: Skipped (--skip-bot)")
        video_path = None
    else:
        video_path = run_reddit_bot(strategy)
    
    # Step 3
    if video_path and video_path.exists():
        metadata = run_post_processing(video_path, strategy)
        store_content(metadata)
        print(f"\n✅ Pipeline Complete!")
        print(f"   Video: {metadata.get('video_file')}")
        print(f"   Title: {metadata.get('title')}")
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        meta_path = OUTPUT_DIR / f"strategy_only_{timestamp}.json"
        meta_path.write_text(json.dumps(strategy, ensure_ascii=False, indent=2))
        print(f"\n⚠️  Strategy saved (no video generated)")


if __name__ == "__main__":
    main()
