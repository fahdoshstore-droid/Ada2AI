#!/usr/bin/env python3
"""
Ada2AI YOLO + VTrim Pipeline — Sports Video Intelligence
Detects players, ball, speech, and auto-edits footage.

Combines:
  - YOLO11 (player/ball detection + tracking)
  - VTrim (lossless trimming + VAD speech detection)
  - FFmpeg (compositing + overlays)

Modes:
  detect     — Detect players/ball, output JSON
  crop       — Auto-crop to 9:16 (vertical TikTok)
  trim       — Lossless trim to action segments (VTrim)
  highlights — Extract high-action segments
  full       — Full pipeline: detect → trim → crop
  vad        — Speech detection only (Silero VAD)

Usage:
  python yolo_pipeline.py --input video.mp4 --mode detect
  python yolo_pipeline.py --input video.mp4 --mode trim
  python yolo_pipeline.py --input video.mp4 --mode full
"""

import argparse
import json
import os
import subprocess
import shutil
from datetime import datetime
from pathlib import Path

import numpy as np

# ─── Config ──────────────────────────────────────────
OUTPUT_DIR = Path(__file__).parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)
DEVICE = "mps" if os.getenv("FORCE_DEVICE") != "cpu" else "cpu"

# YOLO sports-relevant class IDs (COCO)
PERSON = 0
SPORTS_BALL = 32
SPORTS_RELEVANT = [PERSON, SPORTS_BALL]


# ─── VTrim Integration ──────────────────────────────
def run_vtrim(video_path: str, output_path: str = None,
              conf_threshold: float = 0.25, padding: float = 1.0,
              gap_tolerance: float = 4.0, no_vad: bool = False,
              export_xml: str = None) -> dict:
    """Run VTrim (YOLO human detection + Silero VAD + lossless trim).

    Returns dict with segments + trimmed video path.
    """
    try:
        from vtrim.analyzer import detect_human
        from vtrim.vad_analyzer import detect_speech
        from vtrim.segment_utils import merge_segments, apply_padding
        from vtrim.ffmpeg_utils import cut_video_with_ffmpeg
        from vtrim.config import Config
    except ImportError:
        # Try installing vtrim dynamically
        import subprocess, sys
        print("📦 Installing vtrim...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-e",
                       os.path.expanduser("~/video-trimmer"),
                       "--break-system-packages"],
                      capture_output=True)
        from vtrim.analyzer import detect_human
        from vtrim.vad_analyzer import detect_speech
        from vtrim.segment_utils import merge_segments, apply_padding
        from vtrim.ffmpeg_utils import cut_video_with_ffmpeg
        from vtrim.config import Config

    import cv2

    video_path = str(video_path)
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_duration = frame_count / fps if fps > 0 else 0
    cap.release()

    print(f"\n🎬 VTrim: {video_path}")
    print(f"   Duration: {video_duration:.1f}s, FPS: {fps:.1f}")

    # Step 1: Human detection
    print("   🔍 Detecting humans (YOLO)...")
    human_segments = detect_human(video_path, conf_threshold=conf_threshold)
    print(f"   ✅ Found {len(human_segments)} human segments")

    # Step 2: Speech detection (VAD)
    all_segments = human_segments
    if not no_vad:
        print("   🎙️ Detecting speech (Silero VAD)...")
        try:
            speech_segments = detect_speech(video_path)
            print(f"   ✅ Found {len(speech_segments)} speech segments")
            all_segments = human_segments + speech_segments
        except Exception as e:
            print(f"   ⚠️ VAD failed: {e}, skipping")

    # Step 3: Merge + padding
    merged = merge_segments(all_segments, gap_tolerance=gap_tolerance)
    segments = apply_padding(merged, padding=padding, video_duration=video_duration)
    print(f"   ✅ Merged into {len(segments)} segments")

    result = {
        "video": video_path,
        "duration": video_duration,
        "human_segments": len(human_segments),
        "speech_segments": len(all_segments) - len(human_segments) if not no_vad else 0,
        "merged_segments": len(segments),
        "segments": segments,
    }

    # Step 4: Lossless trim
    if output_path and segments:
        print("   ✂️ Trimming (lossless)...")
        try:
            cut_video_with_ffmpeg(video_path, segments, output_path)
            size_mb = Path(output_path).stat().st_size / 1024 / 1024
            print(f"   ✅ Trimmed: {output_path} ({size_mb:.1f} MB)")
            result["trimmed_video"] = output_path
        except Exception as e:
            print(f"   ❌ Trim failed: {e}")
            result["trimmed_video"] = None

    # Step 5: FCP7 XML export
    if export_xml and segments:
        try:
            from vtrim.xml_export import export_fcp7_xml
            export_fcp7_xml(video_path, segments, export_xml, video_duration, fps)
            print(f"   ✅ XML: {export_xml}")
            result["xml_export"] = export_xml
        except Exception as e:
            print(f"   ⚠️ XML export failed: {e}")

    # Save
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = OUTPUT_DIR / f"vtrim_{ts}.json"
    out_file.write_text(json.dumps(result, ensure_ascii=False, indent=2))

    return result


# ─── YOLO Detection ──────────────────────────────────
def detect_video(video_path: str, model_size: str = "n", conf: float = 0.5) -> dict:
    """Detect players and ball in every frame using YOLO11."""
    from ultralytics import YOLO
    model = YOLO(f"yolo11{model_size}.pt")

    print(f"\n🔍 Detecting objects in {video_path}...")
    results = model(video_path, device=DEVICE, conf=conf, stream=True, verbose=False)

    detections = []
    frame_count = 0
    player_boxes = []
    ball_boxes = []

    for r in results:
        frame_count += 1
        boxes = r.boxes
        if boxes is None:
            continue

        for box in boxes:
            cls = int(box.cls[0])
            confidence = float(box.conf[0])
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            if cls == PERSON:
                player_boxes.append([x1, y1, x2, y2, confidence])
            elif cls == SPORTS_BALL:
                ball_boxes.append([x1, y1, x2, y2, confidence])

        if frame_count % 10 == 0:
            detections.append({
                "frame": frame_count,
                "players": len([b for b in player_boxes[-10:]]),
                "balls": len([b for b in ball_boxes[-5:]]),
                "player_boxes": player_boxes[-10:],
                "ball_boxes": ball_boxes[-5:],
            })

    summary = {
        "video": video_path,
        "total_frames": frame_count,
        "total_player_detections": len(player_boxes),
        "total_ball_detections": len(ball_boxes),
        "frames_with_players": len(set(i // 10 for i, _ in enumerate(player_boxes))),
        "device": DEVICE,
        "model": f"yolo11{model_size}",
        "detections_sample": detections[:50],
    }

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = OUTPUT_DIR / f"detect_{ts}.json"
    out_file.write_text(json.dumps(summary, ensure_ascii=False, indent=2))

    print(f"✅ Detection: {frame_count} frames, {len(player_boxes)} players, {len(ball_boxes)} balls")
    return summary


# ─── Auto-crop to 9:16 ──────────────────────────────
def auto_crop_vertical(video_path: str, model_size: str = "n", output_path: str = None) -> str:
    """Auto-crop video to vertical 9:16 by tracking the main action."""
    from ultralytics import YOLO
    model = YOLO(f"yolo11{model_size}.pt")

    print(f"\n✂️ Auto-cropping {video_path} to 9:16...")

    probe = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", video_path],
        capture_output=True, text=True
    )
    info = json.loads(probe.stdout)
    video_stream = [s for s in info["streams"] if s["codec_type"] == "video"][0]
    orig_w = int(video_stream["width"])
    orig_h = int(video_stream["height"])

    target_w, target_h = 1080, 1920

    results = model(video_path, device=DEVICE, conf=0.4, stream=True, verbose=False)
    centers_x = []
    frame_idx = 0

    for r in results:
        frame_idx += 1
        if frame_idx % 5 != 0:
            continue
        if r.boxes is None:
            continue
        for box in r.boxes:
            if int(box.cls[0]) == PERSON:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                centers_x.append((x1 + x2) / 2)

    crop_x = int(np.median(centers_x)) if centers_x else orig_w // 2
    crop_w = min(int(orig_h * target_w / target_h), orig_w)
    crop_x1 = max(0, min(crop_x - crop_w // 2, orig_w - crop_w))

    if not output_path:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = str(OUTPUT_DIR / f"cropped_{ts}.mp4")

    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-vf", f"crop={crop_w}:{orig_h}:{crop_x1}:0,scale={target_w}:{target_h}",
        "-c:v", "libx264", "-preset", "fast", "-crf", "23",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
        str(output_path)
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    if result.returncode == 0 and Path(output_path).exists():
        size_mb = Path(output_path).stat().st_size / 1024 / 1024
        print(f"✅ Cropped: {output_path} ({size_mb:.1f} MB)")
        print(f"   {orig_w}x{orig_h} → {target_w}x{target_h}, action center: x={crop_x}")
        return output_path
    else:
        print(f"❌ Crop failed: {result.stderr[-200:]}")
        return None


# ─── Highlight Extraction ────────────────────────────
def extract_highlights(video_path: str, model_size: str = "n",
                       min_players: int = 5) -> list:
    """Extract segments with most action (players visible)."""
    from ultralytics import YOLO
    model = YOLO(f"yolo11{model_size}.pt")

    print(f"\n⚡ Extracting highlights from {video_path}...")
    results = model(video_path, device=DEVICE, conf=0.4, stream=True, verbose=False)

    frame_data = []
    frame_idx = 0

    for r in results:
        frame_idx += 1
        players = 0
        has_ball = False

        if r.boxes is not None:
            for box in r.boxes:
                cls = int(box.cls[0])
                if cls == PERSON:
                    players += 1
                elif cls == SPORTS_BALL:
                    has_ball = True

        frame_data.append((frame_idx, players, has_ball))

    highlights = []
    in_highlight = False
    start = 0

    for i, (fnum, players, has_ball) in enumerate(frame_data):
        if players >= min_players or (players >= min_players - 2 and has_ball):
            if not in_highlight:
                start = i
                in_highlight = True
        else:
            if in_highlight:
                duration = i - start
                if duration >= 10:
                    highlights.append({
                        "start_frame": frame_data[start][0],
                        "end_frame": frame_data[i][0],
                        "duration_frames": duration,
                        "avg_players": np.mean([d[1] for d in frame_data[start:i]]),
                        "has_ball": any(d[2] for d in frame_data[start:i]),
                    })
                in_highlight = False

    if in_highlight:
        highlights.append({
            "start_frame": frame_data[start][0],
            "end_frame": frame_data[-1][0],
            "duration_frames": len(frame_data) - start,
            "avg_players": np.mean([d[1] for d in frame_data[start:]]),
            "has_ball": any(d[2] for d in frame_data[start:]),
        })

    highlights.sort(key=lambda x: x["avg_players"], reverse=True)

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = OUTPUT_DIR / f"highlights_{ts}.json"
    out_file.write_text(json.dumps(highlights, ensure_ascii=False, indent=2))

    print(f"✅ Found {len(highlights)} highlights")
    for h in highlights[:5]:
        print(f"   Frames {h['start_frame']}-{h['end_frame']} "
              f"({h['duration_frames']} frames, {h['avg_players']:.1f} avg, "
              f"ball: {'⚽' if h['has_ball'] else '❌'})")

    return highlights


# ─── Full Pipeline ───────────────────────────────────
def full_pipeline(video_path: str, model_size: str = "n") -> dict:
    """Full pipeline: VTrim (trim) → YOLO (detect) → crop → highlights."""
    print("\n🚀 Full YOLO + VTrim Pipeline")
    print("=" * 50)

    # Step 1: VTrim — trim to action segments
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    trimmed_path = str(OUTPUT_DIR / f"trimmed_{ts}.mp4")

    print("\n📋 Step 1: VTrim (human + speech detection + lossless trim)")
    vtrim_result = run_vtrim(
        video_path, output_path=trimmed_path,
        conf_threshold=0.25, padding=1.0, gap_tolerance=4.0
    )

    # Use trimmed video for further processing if available
    process_video = vtrim_result.get("trimmed_video") or video_path

    # Step 2: Detect
    print("\n📋 Step 2: YOLO Detection")
    detection = detect_video(process_video, model_size)

    # Step 3: Auto-crop
    print("\n📋 Step 3: Auto-crop to 9:16")
    cropped = auto_crop_vertical(process_video, model_size)

    # Step 4: Highlights
    print("\n📋 Step 4: Highlight extraction")
    highlights = extract_highlights(process_video, model_size)

    result = {
        "input": video_path,
        "vtrim": {k: v for k, v in vtrim_result.items() if k != "segments"},
        "detection": {k: v for k, v in detection.items() if k != "detections_sample"},
        "cropped_video": cropped,
        "highlights": highlights[:10],
        "total_highlights": len(highlights),
        "model": f"yolo11{model_size}",
        "device": DEVICE,
    }

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = OUTPUT_DIR / f"yolo_pipeline_{ts}.json"
    out_file.write_text(json.dumps(result, ensure_ascii=False, indent=2))

    print(f"\n✅ Pipeline complete!")
    if vtrim_result.get("trimmed_video"):
        print(f"   Trimmed: {vtrim_result['trimmed_video']}")
    if cropped:
        print(f"   Cropped: {cropped}")
    print(f"   Highlights: {len(highlights)} segments")

    return result


# ─── Main ──────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Ada2AI YOLO + VTrim Pipeline")
    parser.add_argument("--input", "-i", type=str, required=True, help="Input video path")
    parser.add_argument("--mode", "-m", type=str, default="full",
                       choices=["detect", "crop", "highlights", "trim", "vad", "full"],
                       help="Pipeline mode (trim uses VTrim)")
    parser.add_argument("--model-size", type=str, default="n",
                       choices=["n", "s", "m", "l", "x"],
                       help="YOLO model size")
    parser.add_argument("--conf", type=float, default=0.5, help="Confidence threshold")
    parser.add_argument("--output", "-o", type=str, default=None, help="Output path")
    parser.add_argument("--no-vad", action="store_true", help="Skip VAD speech detection")
    parser.add_argument("--export-xml", type=str, default=None, help="Export FCP7 XML")
    args = parser.parse_args()

    if not Path(args.input).exists():
        print(f"❌ File not found: {args.input}")
        return

    if args.mode == "detect":
        detect_video(args.input, args.model_size, args.conf)
    elif args.mode == "crop":
        auto_crop_vertical(args.input, args.model_size, args.output)
    elif args.mode == "highlights":
        extract_highlights(args.input, args.model_size)
    elif args.mode == "trim":
        run_vtrim(args.input, output_path=args.output,
                  conf_threshold=args.conf, no_vad=args.no_vad,
                  export_xml=args.export_xml)
    elif args.mode == "vad":
        run_vtrim(args.input, conf_threshold=args.conf, no_vad=False,
                  export_xml=args.export_xml)
    elif args.mode == "full":
        full_pipeline(args.input, args.model_size)


if __name__ == "__main__":
    main()