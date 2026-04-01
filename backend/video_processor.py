"""
Video Processor - Extract frames from video using FFmpeg/OpenCV
"""

import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional
import tempfile
import os


class VideoProcessor:
    """Handles video loading and frame extraction."""
    
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = None
        self.fps = None
        self.frame_count = None
        self.width = None
        self.height = None
        
    def open(self) -> bool:
        """Open the video file."""
        self.cap = cv2.VideoCapture(self.video_path)
        if not self.cap.isOpened():
            return False
        
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        return True
    
    def get_frame(self, frame_number: int) -> Optional[np.ndarray]:
        """Get a specific frame by number."""
        if not self.cap or not self.cap.isOpened():
            return None
        
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = self.cap.read()
        return frame if ret else None
    
    def extract_frames(self, interval: int = 1, max_frames: Optional[int] = None) -> List[Tuple[int, np.ndarray]]:
        """Extract frames at regular intervals.
        
        Args:
            interval: Extract every N frames
            max_frames: Maximum number of frames to extract
            
        Returns:
            List of (frame_number, frame) tuples
        """
        frames = []
        frame_number = 0
        
        while True:
            ret, frame = self.cap.read()
            if not ret:
                break
            
            if frame_number % interval == 0:
                frames.append((frame_number, frame))
                
                if max_frames and len(frames) >= max_frames:
                    break
            
            frame_number += 1
        
        return frames
    
    def extract_frames_to_disk(self, output_dir: str, interval: int = 1, max_frames: Optional[int] = None) -> List[str]:
        """Extract frames and save to disk.
        
        Args:
            output_dir: Directory to save frames
            interval: Extract every N frames
            max_frames: Maximum number of frames
            
        Returns:
            List of saved frame file paths
        """
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        frames = self.extract_frames(interval, max_frames)
        saved_paths = []
        
        for frame_num, frame in frames:
            frame_path = output_path / f"frame_{frame_num:06d}.jpg"
            cv2.imwrite(str(frame_path), frame)
            saved_paths.append(str(frame_path))
        
        return saved_paths
    
    def get_video_info(self) -> dict:
        """Get video metadata."""
        return {
            "fps": self.fps,
            "frame_count": self.frame_count,
            "width": self.width,
            "height": self.height,
            "duration": self.frame_count / self.fps if self.fps else 0
        }
    
    def close(self):
        """Release video resources."""
        if self.cap:
            self.cap.release()
    
    def __enter__(self):
        self.open()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def extract_frames_from_bytes(video_bytes: bytes, interval: int = 1, max_frames: Optional[int] = None) -> List[Tuple[int, np.ndarray]]:
    """Extract frames from video bytes.
    
    Args:
        video_bytes: Raw video file bytes
        interval: Extract every N frames
        max_frames: Maximum frames to extract
        
    Returns:
        List of (frame_number, frame) tuples
    """
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp:
        tmp.write(video_bytes)
        tmp_path = tmp.name
    
    try:
        with VideoProcessor(tmp_path) as vp:
            return vp.extract_frames(interval, max_frames)
    finally:
        os.unlink(tmp_path)
