"""
YOLO Analyzer - Object detection using YOLO
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from ultralytics import YOLO
import torch


class YOLOAnalyzer:
    """Handles YOLO object detection for player/ball detection."""
    
    # COCO class IDs for sports analysis
    PERSON_CLASS = 0
    SPORTS_BALL_CLASS = 37  # May vary by model
    
    def __init__(self, model_name: str = "yolov8n.pt"):
        """Initialize YOLO model.
        
        Args:
            model_name: YOLO model to use (yolov8n.pt, yolov8s.pt, etc.)
        """
        self.model = YOLO(model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
    
    def detect_players(self, frame: np.ndarray, conf_threshold: float = 0.5) -> List[Dict]:
        """Detect players in a frame.
        
        Args:
            frame: Image frame
            conf_threshold: Confidence threshold
            
        Returns:
            List of detections with bbox, confidence, class
        """
        results = self.model(frame, conf=conf_threshold, device=self.device)[0]
        
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            
            # Only include person detections
            if cls == self.PERSON_CLASS:
                detections.append({
                    "bbox": [float(x1), float(y1), float(x2), float(y2)],
                    "confidence": conf,
                    "class": cls,
                    "center": [(x1 + x2) / 2, (y1 + y2) / 2],
                    "width": x2 - x1,
                    "height": y2 - y1
                })
        
        return detections
    
    def detect_all(self, frame: np.ndarray, conf_threshold: float = 0.5) -> List[Dict]:
        """Detect all objects in a frame.
        
        Args:
            frame: Image frame
            conf_threshold: Confidence threshold
            
        Returns:
            List of all detections
        """
        results = self.model(frame, conf=conf_threshold, device=self.device)[0]
        
        detections = []
        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            
            detections.append({
                "bbox": [float(x1), float(y1), float(x2), float(y2)],
                "confidence": conf,
                "class": cls,
                "center": [(x1 + x2) / 2, (y1 + y2) / 2],
                "width": x2 - x1,
                "height": y2 - y1
            })
        
        return detections
    
    def analyze_frames(self, frames: List[Tuple[int, np.ndarray]], conf_threshold: float = 0.5) -> List[Dict]:
        """Analyze multiple frames.
        
        Args:
            frames: List of (frame_number, frame) tuples
            conf_threshold: Confidence threshold
            
        Returns:
            List of frame analysis results
        """
        results = []
        
        for frame_num, frame in frames:
            detections = self.detect_players(frame, conf_threshold)
            results.append({
                "frame_number": frame_num,
                "player_count": len(detections),
                "players": detections
            })
        
        return results


def calculate_player_stats(detections_by_frame: List[Dict], fps: float, pixels_per_meter: float = 100.0) -> Dict:
    """Calculate player statistics from detection history.
    
    Args:
        detections_by_frame: List of frame detections
        fps: Video FPS
        pixels_per_meter: Conversion factor
        
    Returns:
        Player statistics
    """
    total_distance = 0.0
    positions = []
    speeds = []
    
    for i, frame_data in enumerate(detections_by_frame):
        for player in frame_data.get("players", []):
            center = player["center"]
            positions.append({
                "frame": frame_data["frame_number"],
                "x": center[0],
                "y": center[1]
            })
    
    # Calculate distances between consecutive positions
    for i in range(1, len(positions)):
        prev = positions[i - 1]
        curr = positions[i]
        
        dx = curr["x"] - prev["x"]
        dy = curr["y"] - prev["y"]
        distance_pixels = np.sqrt(dx ** 2 + dy ** 2)
        distance_meters = distance_pixels / pixels_per_meter
        
        total_distance += distance_meters
        
        # Calculate speed (meters per second)
        frame_diff = curr["frame"] - prev["frame"]
        time_diff = frame_diff / fps
        if time_diff > 0:
            speed = distance_meters / time_diff
            speeds.append(speed)
    
    avg_speed = np.mean(speeds) if speeds else 0
    max_speed = np.max(speeds) if speeds else 0
    
    return {
        "total_distance_meters": round(total_distance, 2),
        "average_speed_mps": round(avg_speed, 2),
        "max_speed_mps": round(max_speed, 2),
        "positions": positions
    }
