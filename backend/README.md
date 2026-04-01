# Ada2AI YOLO Video Analysis Backend

FastAPI server for football video analysis using YOLO object detection.

## Features

- **Single Player Analysis**: Track a specific player's movement, calculate speed and distance
- **Team Analysis**: Detect all players, assign team IDs, generate formation maps
- **Frame Detection**: Detect players in single images

## Requirements

- Python 3.9+
- FFmpeg (for video processing)
- CUDA-capable GPU (optional, for faster inference)

## Installation

1. **Create virtual environment**:
```bash
cd ~/Ada2AI/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Install FFmpeg** (if not already installed):
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Running the Server

```bash
# Start the server
python main.py

# Or with uvicorn
uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

The API will be available at `http://localhost:5001`

## API Endpoints

### Health Check
```bash
GET /health
```

### Single Player Analysis
```bash
POST /analyze/single
```
Parameters:
- `video`: Video file (MP4, AVI, etc.)
- `conf_threshold`: YOLO confidence threshold (default: 0.5)
- `frame_interval`: Extract every N frames (default: 5)
- `max_frames`: Maximum frames to process (optional)
- `pixels_per_meter`: Conversion factor for speed (default: 100)

### Team Analysis
```bash
POST /analyze/team
```
Parameters:
- `video`: Video file
- `conf_threshold`: YOLO confidence threshold (default: 0.5)
- `frame_interval`: Extract every N frames (default: 5)
- `max_frames`: Maximum frames to process (optional)

### Frame Detection
```bash
POST /detect/frame
```
Parameters:
- `file`: Image file (JPG, PNG)

## Example Usage

### Using curl

```bash
# Single player analysis
curl -X POST "http://localhost:5001/analyze/single" \
  -F "video=@video.mp4" \
  -F "conf_threshold=0.5" \
  -F "frame_interval=5"

# Team analysis
curl -X POST "http://localhost:5001/analyze/team" \
  -F "video=@video.mp4"

# Detect in image
curl -X POST "http://localhost:5001/detect/frame" \
  -F "file=@frame.jpg"
```

### Using Python

```python
import requests

# Single player analysis
with open("video.mp4", "rb") as f:
    response = requests.post(
        "http://localhost:5001/analyze/single",
        files={"video": f},
        data={"conf_threshold": 0.5, "frame_interval": 5}
    )
    print(response.json())
```

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── yolo_analyzer.py    # YOLO detection logic
├── video_processor.py  # Frame extraction
├── player_tracker.py   # Player tracking across frames
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Response Format

### Single Player Analysis
```json
{
  "track_id": 0,
  "total_distance_meters": 150.5,
  "average_speed_mps": 2.3,
  "max_speed_mps": 4.1,
  "positions": [...],
  "frames_analyzed": 100,
  "video_info": {...}
}
```

### Team Analysis
```json
{
  "total_players_detected": 22,
  "team1_count": 11,
  "team2_count": 11,
  "formation": {...},
  "tracks": {...},
  "frames_analyzed": 100,
  "video_info": {...}
}
```

## Notes

- First run will download YOLO model (~6MB for nano model)
- GPU recommended for faster processing
- Adjust `conf_threshold` based on video quality
- Lower `frame_interval` = more frames = slower but more accurate

## License

MIT
