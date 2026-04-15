#!/usr/bin/env python3
"""
Ada2AI Content Pipeline — Orchestrator
Generates viral sports content using AI + RedditVideoMakerBot or Agentic Streams

Flow:
  Task → Content Strategy (AI) → Content Source → Post-Processing (AI) → Store

Content sources:
  - RedditVideoMakerBot (source: "reddit")  — Reddit thread → video
  - Agentic Streams     (source: "web")     — Web research → VideoDB video

Usage:
  python orchestrator.py --topic "best football players" --subreddit soccer
  python orchestrator.py --topic "best football players" --source web
  python orchestrator.py --auto  # picks trending topic via AI
"""

import json
import os
import subprocess
import sys
import argparse
import urllib.request
import urllib.error
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, Union

# ─── Config ───────────────────────────────────────────
PIPELINE_DIR = Path(__file__).parent
ADA2AI_DIR = PIPELINE_DIR.parent
REDDIT_BOT_DIR = Path.home() / "RedditVideoMakerBot"
AGENTIC_STREAMS_DIR = Path.home() / "agentic-streams"
AGENTIC_VIDEO_EDITOR_DIR = Path.home() / "agentic-video-editor"
OUTPUT_DIR = PIPELINE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:14b")
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
VIDEODB_API_KEY = os.getenv("VIDEODB_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

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
def run_content_strategy(topic: str, subreddit: str = None, tone: str = "engaging",
                         source: str = "reddit") -> dict:
    """Use AI to generate content strategy."""
    
    source_desc = "Reddit threads" if source == "reddit" else "Web research via Agentic Streams / VideoDB"
    
    prompt = f"""You are a sports content expert. Create a viral video strategy for:

Topic: {topic}
Subreddit: {subreddit or "auto-detect"}
Tone: {tone}
Source: {source_desc}

Respond with JSON only:
{{
  "subreddit": "best subreddit name",
  "thread_type": "askreddit",
  "search_query": "search keywords",
  "angle": "content angle/hook",
  "hook": "opening line in Arabic",
  "title_template": "video title in Arabic",
  "tags": ["hashtag1", "hashtag2"],
  "platform": "tiktok",
  "duration_target": 45,
  "tts_language": "ar",
  "source": "{source}",
  "research_angles": ["angle 1", "angle 2", "angle 3"],
  "visual_style": "description of desired visual style"
}}"""

    response = ai_call(prompt)
    strategy = extract_json(response)
    
    # Ensure source is set
    strategy["source"] = source
    
    # Save strategy
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    strategy_file = OUTPUT_DIR / f"strategy_{timestamp}.json"
    strategy_file.write_text(json.dumps(strategy, ensure_ascii=False, indent=2))
    
    print(f"✅ Content strategy generated")
    print(f"   Source: {source}")
    print(f"   Subreddit: r/{strategy.get('subreddit', '?')}")
    print(f"   Angle: {strategy.get('angle', '?')}")
    print(f"   Hook: {strategy.get('hook', '?')}")
    
    return strategy


# ─── Step 2a: Execute RedditVideoMakerBot ──────────────
def run_reddit_bot(strategy: dict) -> Optional[Path]:
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


# ─── Step 2b: Execute Agentic Streams (VideoDB) ──────
def run_agentic_streams(topic: str, strategy: dict) -> Optional[str]:
    """
    Run the Agentic Streams content-creator pipeline via VideoDB SDK.
    
    Uses VideoDB to:
      1. Research the topic (via AI-generated brief)
      2. Generate voiceover narration
      3. Generate visuals (AI images/videos)
      4. Compose on a multi-track timeline
      5. Deliver an HLS stream URL
    
    Returns the stream URL or None on failure.
    """
    if not VIDEODB_API_KEY:
        print("❌ VIDEO_DB_API_KEY not set. Get one at https://console.videodb.io")
        return None

    print(f"\n🎬 Running Agentic Streams for: {topic}")
    
    # Generate a unique slug for this run
    slug = uuid.uuid4().hex[:8]
    work_dir = Path(f"/tmp/vb_{slug}")
    work_dir.mkdir(parents=True, exist_ok=True)
    print(f"   Run slug: {slug}")
    
    try:
        import videodb
        
        # Connect to VideoDB
        conn = videodb.connect(api_key=VIDEODB_API_KEY)
        coll = conn.get_collection()
        
        # ── Phase 1: Generate a research brief via AI ──
        print("   Phase 1: Research brief...")
        research_angles = strategy.get("research_angles", [
            "latest stats and records",
            "fan reactions and highlights", 
            "historical context and comparisons"
        ])
        
        research_prompt = f"""Research the topic: "{topic}"
Angles: {json.dumps(research_angles, ensure_ascii=False)}
Target: sports video content for Arabic audience.

Provide a structured brief with:
- HOOK: the single most compelling finding
- FINDINGS: 4-6 key facts ranked by impact
- VISUAL_OPPORTUNITIES: data points that could be visualized
- NARRATIVE_THREAD: 2-3 sentences describing the story

Be factual, current, and audience-engaging."""

        research_brief = ai_call(research_prompt, max_tokens=800)
        (work_dir / "research_brief.txt").write_text(research_brief)
        print("   ✅ Research brief generated")
        
        # ── Phase 2: Script generation ──
        print("   Phase 2: Generating video script...")
        duration_target = strategy.get("duration_target", 60)
        script_prompt = f"""Based on this research, create a {duration_target}-second video script for: "{topic}"

Research brief:
{research_brief}

Audience: Arabic-speaking sports fans.
Tone: {strategy.get('tone', 'engaging')}

Return JSON only:
{{
  "title": "punchy title (appears as title card)",
  "segments": [
    {{
      "id": "hook",
      "narration": "2-3 sentences of spoken narration in Arabic",
      "visual_type": "motion_scene",
      "visual_direction": "specific visual description",
      "data_callout": null,
      "mood": "surprising, attention-grabbing"
    }}
  ],
  "music_direction": "brief description of background music style",
  "outro": "closing text in Arabic"
}}

Include 4-6 segments following narrative arc: hook → context → insights → takeaway → close.
Visual types: motion_scene, image_scene, kinetic_text, data_viz, browser_capture.
Never repeat same visual type for consecutive segments."""

        script_raw = ai_call(script_prompt, max_tokens=1000)
        script = extract_json(script_raw)
        (work_dir / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=2))
        print(f"   ✅ Script: {len(script.get('segments', []))} segments")
        
        # ── Phase 3: Asset production ──
        print("   Phase 3: Producing assets via VideoDB...")
        assets = {"narrations": [], "visuals": [], "music": None}
        
        for i, segment in enumerate(script.get("segments", [])):
            seg_id = segment.get("id", f"seg_{i}")
            narration_text = segment.get("narration", "")
            visual_type = segment.get("visual_type", "image_scene")
            visual_direction = segment.get("visual_direction", "Abstract sports scene")
            
            # Generate narration audio
            try:
                narration_audio = coll.generate_audio(
                    text=narration_text,
                    language="ar",
                    style="news"
                )
                assets["narrations"].append(narration_audio)
                print(f"   🎙️  Narration: {seg_id}")
            except Exception as e:
                print(f"   ⚠️  Narration failed for {seg_id}: {e}")
                assets["narrations"].append(None)
            
            # Generate visual asset
            try:
                if visual_type == "motion_scene":
                    visual = coll.generate_video(
                        prompt=visual_direction,
                        duration=6
                    )
                    assets["visuals"].append({"type": "video", "asset": visual})
                    print(f"   🎥 Video: {seg_id}")
                else:
                    # For image_scene, kinetic_text, data_viz, browser_capture — use image
                    img_prompt = f"{visual_direction}, 16:9 aspect ratio, broadcast quality"
                    visual = coll.generate_image(prompt=img_prompt)
                    assets["visuals"].append({"type": "image", "asset": visual})
                    print(f"   🖼️  Image: {seg_id}")
            except Exception as e:
                print(f"   ⚠️  Visual failed for {seg_id}: {e}")
                assets["visuals"].append(None)
        
        # Generate background music
        try:
            music_direction = script.get("music_direction", "upbeat electronic sports background")
            music = coll.generate_audio(
                text=f"Background music: {music_direction}",
                language="en",
                style="music"
            )
            assets["music"] = music
            print("   🎵 Background music generated")
        except Exception as e:
            print(f"   ⚠️  Music failed: {e}")
        
        # ── Phase 4: Composition ──
        print("   Phase 4: Composing timeline...")
        try:
            timeline = coll.create_timeline(name=f"ada2ai_{slug}")
            
            # Add visual track (bottom layer)
            current_time = 0.0
            for i, visual_item in enumerate(assets["visuals"]):
                if visual_item is None:
                    continue
                asset = visual_item["asset"]
                try:
                    if visual_item["type"] == "video":
                        duration = getattr(asset, 'length', None) or 6.0
                    else:
                        duration = 12.0  # default image display duration
                    
                    timeline.add_asset(asset, start=current_time, duration=duration)
                    current_time += duration
                except Exception as e:
                    print(f"   ⚠️  Visual {i} timeline add failed: {e}")
            
            # Add narration track (overlaid)
            narration_time = 2.0  # start narration 2s after visuals
            for narration_audio in assets["narrations"]:
                if narration_audio is None:
                    continue
                try:
                    narr_duration = getattr(narration_audio, 'length', None) or 10.0
                    timeline.add_audio(narration_audio, start=narration_time, duration=narr_duration)
                    narration_time += narr_duration + 0.5  # small gap between narrations
                except Exception as e:
                    print(f"   ⚠️  Narration timeline add failed: {e}")
            
            # Add music track (quiet background)
            if assets["music"]:
                try:
                    total_duration = max(current_time, narration_time) + 3.0
                    timeline.add_audio(assets["music"], start=0, duration=total_duration)
                except Exception as e:
                    print(f"   ⚠️  Music timeline add failed: {e}")
            
            # Generate stream
            stream_url = timeline.stream()
            
            # Save stream URL
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            stream_info = {
                "topic": topic,
                "slug": slug,
                "stream_url": stream_url,
                "player_url": f"https://player.videodb.io/watch?v={stream_url}",
                "script": script,
                "generated_at": timestamp
            }
            stream_file = OUTPUT_DIR / f"agentic_streams_{timestamp}.json"
            stream_file.write_text(json.dumps(stream_info, ensure_ascii=False, indent=2))
            
            print(f"   ✅ Stream URL: {stream_url}")
            print(f"   ▶  Player: https://player.videodb.io/watch?v={stream_url}")
            return stream_url
            
        except Exception as e:
            print(f"   ❌ Composition failed: {e}")
            return None
        
    except ImportError:
        print("❌ videodb package not installed. Run: pip install videodb python-dotenv")
        return None
    except Exception as e:
        print(f"❌ Agentic Streams failed: {e}")
        return None
    finally:
        # Clean up work directory
        shutil.rmtree(work_dir, ignore_errors=True)


# ─── Step 2.5: Agentic Video Editor (post-processing enhancement) ──
def run_agentic_video_editor(video_path: Union[Path, str], strategy: dict) -> Optional[Path]:
    """
    Run the Agentic Video Editor pipeline on a raw video from Step 2.

    Takes the raw video produced by RedditVideoMakerBot or Agentic Streams,
    builds a CreativeBrief from the content strategy, runs the full
    agentic-video-editor pipeline (preprocess -> director -> trim_refiner
    -> editor -> reviewer), and retries if the reviewer score is below 0.7.

    For stream URLs (Agentic Streams), the video must first be downloaded
    to a local MP4 before processing.

    Args:
        video_path: Path to the raw video MP4 (local file).
            If it's an HLS stream URL, the function downloads it first.
        strategy: The content strategy dict from Step 1.

    Returns:
        Path to the polished/enhanced MP4, or None on failure.
    """
    if not GOOGLE_API_KEY:
        print("❌ GOOGLE_API_KEY not set. Get one at https://aistudio.google.com/apikey")
        return None

    # Ensure the video is a local MP4 file
    is_stream = isinstance(video_path, str) and (
        video_path.startswith("http") or video_path.endswith(".m3u8")
    )

    if is_stream:
        print("   Downloading stream for Agentic Video Editor...")
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            local_path = OUTPUT_DIR / f"downloaded_{timestamp}.mp4"
            # Use ffmpeg to download HLS stream
            cmd = [
                "ffmpeg", "-y", "-i", str(video_path),
                "-c", "copy", str(local_path)
            ]
            subprocess.run(cmd, capture_output=True, timeout=120)
            video_path = local_path
            print(f"   Downloaded to: {local_path}")
        except Exception as e:
            print(f"   ❌ Failed to download stream: {e}")
            return None

    video_path = Path(video_path)
    if not video_path.exists():
        print(f"❌ Video file not found: {video_path}")
        return None

    if not AGENTIC_VIDEO_EDITOR_DIR.exists():
        print(f"❌ Agentic Video Editor not found at: {AGENTIC_VIDEO_EDITOR_DIR}")
        return None

    print(f"\n🎬 Running Agentic Video Editor on: {video_path.name}")
    print(f"   GOOGLE_API_KEY: {'set' if GOOGLE_API_KEY else 'NOT SET'}")

    # Build CreativeBrief from the content strategy
    topic = strategy.get("angle", strategy.get("subreddit", "sports content"))
    duration_target = strategy.get("duration_target", 30)
    tone = strategy.get("tone", "engaging")
    visual_style = strategy.get("visual_style", "dynamic sports content")

    brief_data = {
        "product": topic,
        "audience": "Arabic-speaking sports fans",
        "tone": tone,
        "duration_seconds": duration_target,
        "style_ref": None,
    }

    # Set up working directories
    slug = uuid.uuid4().hex[:8]
    editor_work_dir = OUTPUT_DIR / f"editor_work_{slug}"
    editor_work_dir.mkdir(parents=True, exist_ok=True)

    # Place video into a "footage" subdirectory for preprocessing
    footage_dir = editor_work_dir / "footage"
    footage_dir.mkdir(parents=True, exist_ok=True)
    footage_video = footage_dir / video_path.name
    shutil.copy2(str(video_path), str(footage_video))

    footage_index_path = str(editor_work_dir / "footage_index.json")
    pipeline_yaml = str(AGENTIC_VIDEO_EDITOR_DIR / "pipelines" / "ugc-ad.yaml")
    editor_output_dir = str(editor_work_dir / "output")

    # Ensure Google API key is in environment for the editor agents
    env_overrides = {**os.environ, "GOOGLE_API_KEY": GOOGLE_API_KEY}

    try:
        # Add agentic-video-editor src to sys.path for imports
        editor_src = str(AGENTIC_VIDEO_EDITOR_DIR / "src")
        if editor_src not in sys.path:
            sys.path.insert(0, editor_src)

        from src.models.schemas import CreativeBrief, ReviewScore
        from src.pipeline.preprocess import preprocess_footage
        from src.pipeline.runner import PipelineResult, run_pipeline
        from src.agents.director import run_director, build_director
        from src.agents.trim_refiner import refine_plan
        from src.agents.editor import run_editor
        from src.agents.reviewer import run_reviewer

        # Step 2.5a: Preprocess footage
        print("   Step 2.5a: Preprocessing footage...")
        footage_index = preprocess_footage(
            input_dir=str(footage_dir),
            output_path=footage_index_path,
        )
        print(f"   ✅ Footage index: {len(footage_index.shots)} shot(s)")

        # Build the CreativeBrief
        brief = CreativeBrief.model_validate(brief_data)

        # Step 2.5b: Run the pipeline — director → trim_refiner → editor
        # We run the pipeline manually (instead of via YAML) to control the
        # retry loop with our 0.7 threshold.
        print("   Step 2.5b: Running Director agent...")
        max_retries = 3
        feedback_history: list[str] = []
        best_video: Optional[str] = None

        from google.adk.runners import InMemoryRunner
        from google.genai import types as genai_types

        # Reuse the feedback injection pattern from the pipeline runner
        _DIRECTOR_APP_NAME = "agentic-video-editor"
        _DIRECTOR_USER_ID = "director-user"

        for attempt in range(max_retries + 1):
            try:
                # Run Director
                if attempt == 0:
                    edit_plan = run_director(brief, footage_index_path)
                else:
                    # Run Director with feedback
                    agent = build_director(brief)
                    runner = InMemoryRunner(agent=agent, app_name=_DIRECTOR_APP_NAME)
                    combined_feedback = "\n\n".join(feedback_history)
                    feedback_block = (
                        "\n\n## Reviewer feedback from previous attempt "
                        "(address these issues in the new plan)\n"
                        f"{combined_feedback.strip()}\n\n"
                        "Produce a revised EditPlan that directly addresses the feedback above."
                    )
                    user_message = genai_types.Content(
                        role="user",
                        parts=[genai_types.Part(
                            text=(
                                "Build a REVISED EditPlan for the following brief.\n\n"
                                f"Brief JSON: {brief.model_dump_json()}\n\n"
                                f"Footage index path: {footage_index_path}\n\n"
                                "Produce the revised EditPlan now."
                                + feedback_block
                            )
                        )],
                    )
                    import asyncio
                    async def _run_director_retry():
                        session = await runner.session_service.create_session(
                            app_name=_DIRECTOR_APP_NAME,
                            user_id=_DIRECTOR_USER_ID,
                        )
                        final_text = None
                        async for event in runner.run_async(
                            user_id=_DIRECTOR_USER_ID,
                            session_id=session.id,
                            new_message=user_message,
                        ):
                            if event.is_final_response() and event.content and event.content.parts:
                                text = "".join(
                                    part.text for part in event.content.parts
                                    if getattr(part, "text", None) and not getattr(part, "thought", False)
                                )
                                if text.strip():
                                    final_text = text
                        if not final_text:
                            raise RuntimeError("Director retry returned no final response")
                        from src.models.schemas import EditPlan
                        return EditPlan.model_validate_json(final_text)
                    edit_plan = asyncio.run(_run_director_retry())

                print(f"      Director: {len(edit_plan.entries)} entries, "
                      f"duration={edit_plan.total_duration:.1f}s")

                # Run Trim Refiner
                print("   Step 2.5c: Running Trim Refiner...")
                edit_plan = refine_plan(edit_plan, footage_index_path, output_dir=editor_output_dir)

                # Run Editor
                print("   Step 2.5d: Running Editor agent...")
                rendered_video = run_editor(edit_plan, footage_index_path)

                if not rendered_video or not Path(rendered_video).exists():
                    print(f"   ⚠️ Editor did not produce a valid video")
                    continue

                best_video = rendered_video
                print(f"   ✅ Rendered video: {rendered_video}")

                # Run Reviewer
                print("   Step 2.5e: Running Reviewer agent...")
                review = run_reviewer(brief, rendered_video)
                print(f"   📊 Review score: overall={review.overall:.2f} "
                      f"adherence={review.adherence:.2f} "
                      f"pacing={review.pacing:.2f} "
                      f"visual_quality={review.visual_quality:.2f} "
                      f"watchability={review.watchability:.2f}")

                if review.overall >= 0.7:
                    print(f"   ✅ Review passed (overall={review.overall:.2f} >= 0.7)")
                    break
                else:
                    print(f"   ⚠️ Review below threshold (overall={review.overall:.2f} < 0.7)")
                    if attempt < max_retries:
                        print(f"   🔄 Retrying with feedback ({attempt + 1}/{max_retries})...")
                        feedback_history.append(review.feedback)
                    else:
                        print(f"   ⚠️ Max retries reached, using best video")

            except FileNotFoundError as e:
                print(f"   ❌ File not found: {e}")
                break
            except Exception as e:
                print(f"   ❌ Agent error: {e}")
                break

        if best_video and Path(best_video).exists():
            # Copy the final polished video to the pipeline output directory
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            final_editor_path = OUTPUT_DIR / f"edited_{timestamp}.mp4"
            shutil.copy2(best_video, final_editor_path)
            print(f"✅ Agentic Video Editor complete: {final_editor_path}")

            # Clean up working directory
            shutil.rmtree(editor_work_dir, ignore_errors=True)

            return final_editor_path

        print("❌ Agentic Video Editor failed to produce a video")
        return None

    except ImportError as e:
        print(f"❌ Cannot import agentic-video-editor: {e}")
        print(f"   Ensure the repo at {AGENTIC_VIDEO_EDITOR_DIR} is installed:")
        print(f"   cd {AGENTIC_VIDEO_EDITOR_DIR} && pip install -e .")
        shutil.rmtree(editor_work_dir, ignore_errors=True)
        return None
    except Exception as e:
        print(f"❌ Agentic Video Editor failed: {e}")
        shutil.rmtree(editor_work_dir, ignore_errors=True)
        return None


# ─── Step 3: Post-Processing ──────────────────────────
def run_post_processing(video_path: Union[Path, str], strategy: dict) -> dict:
    """AI-powered post-processing: metadata, captions, thumbnail.
    
    For Agentic Streams (video_path is an HLS URL), we skip ffmpeg processing
    and focus on metadata generation only.
    """
    is_stream = isinstance(video_path, str) and (video_path.startswith("http") or video_path.endswith(".m3u8"))
    
    if is_stream:
        print(f"\n🎨 Post-processing (stream): {video_path[:60]}...")
    else:
        print(f"\n🎨 Post-processing: {Path(video_path).name}...")
    
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
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # For streams, skip ffmpeg text overlay — store stream URL as video_file
    if is_stream:
        metadata["video_file"] = video_path
        metadata["video_type"] = "hls_stream"
        meta_path = OUTPUT_DIR / f"metadata_{timestamp}.json"
        meta_data = {**metadata, "strategy": strategy, "generated_at": timestamp}
        meta_path.write_text(json.dumps(meta_data, ensure_ascii=False, indent=2))
        print(f"✅ Metadata saved (stream)")
        return meta_data
    
    # For local MP4 files, apply ffmpeg text overlay
    video_path = Path(video_path)
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
            shutil.copy2(video_path, final_path)
    else:
        shutil.copy2(video_path, final_path)
    
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
    parser.add_argument("--source", type=str, choices=["reddit", "web"], default=None,
                        help="Content source: 'reddit' for RedditVideoMakerBot, 'web' for Agentic Streams")
    parser.add_argument("--auto", action="store_true", help="Auto-pick trending topic")
    parser.add_argument("--tone", type=str, default="engaging")
    parser.add_argument("--skip-bot", action="store_true", help="Skip content generation step")
    parser.add_argument("--editor", type=str, choices=["none", "agentic"], default="none",
                        help="Post-processing video editor: 'none' (skip) or 'agentic' (use Agentic Video Editor)")
    args = parser.parse_args()
    
    print("🚀 Ada2AI Content Pipeline")
    print("=" * 50)
    
    if args.auto and not args.topic:
        args.topic = "best football moments 2025"
        args.subreddit = "soccer"
    
    if not args.topic:
        print("❌ Specify --topic or use --auto")
        sys.exit(1)
    
    # Default source: reddit
    source = args.source or "reddit"
    
    # Step 1
    print(f"\n📋 Step 1: Content Strategy")
    strategy = run_content_strategy(args.topic, args.subreddit, args.tone, source=source)
    
    # Step 2: Choose content source based on strategy["source"]
    content_source = strategy.get("source", source)
    
    if args.skip_bot:
        print("\n⏭️  Step 2: Skipped (--skip-bot)")
        video_result = None
    elif content_source == "web":
        print(f"\n🌐 Step 2: Agentic Streams (web research source)")
        video_result = run_agentic_streams(args.topic, strategy)
    else:
        print(f"\n📱 Step 2: RedditVideoMakerBot (reddit source)")
        video_result = run_reddit_bot(strategy)
    
    # Step 2.5: Agentic Video Editor (optional enhancement)
    if video_result and args.editor == "agentic":
        print(f"\n✂️  Step 2.5: Agentic Video Editor (enhancement)")
        edited_video = run_agentic_video_editor(video_result, strategy)
        if edited_video:
            video_result = edited_video
        else:
            print("   ⚠️  Editor failed, continuing with raw video")
    elif args.editor == "agentic" and not video_result:
        print("\n⏭️  Step 2.5: Skipped (no video from Step 2)")
    
    # Step 3
    if video_result:
        metadata = run_post_processing(video_result, strategy)
        store_content(metadata)
        print(f"\n✅ Pipeline Complete!")
        if isinstance(video_result, str) and video_result.startswith("http"):
            print(f"   Stream: {video_result}")
        else:
            print(f"   Video: {metadata.get('video_file')}")
        print(f"   Title: {metadata.get('title')}")
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        meta_path = OUTPUT_DIR / f"strategy_only_{timestamp}.json"
        meta_path.write_text(json.dumps(strategy, ensure_ascii=False, indent=2))
        print(f"\n⚠️  Strategy saved (no video generated)")


if __name__ == "__main__":
    main()