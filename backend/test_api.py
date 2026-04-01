#!/usr/bin/env python3
"""
Test script for Ada2AI YOLO Video Analysis API
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")
    from video_processor import VideoProcessor
    from yolo_analyzer import YOLOAnalyzer
    from player_tracker import PlayerTracker
    from main import app
    print("✅ All imports successful")
    return True


def test_yolo_init():
    """Test YOLO analyzer initialization."""
    print("\nTesting YOLO initialization...")
    from yolo_analyzer import YOLOAnalyzer
    analyzer = YOLOAnalyzer("yolov8n.pt")
    print("✅ YOLO analyzer initialized")
    return True


def test_tracker():
    """Test player tracker."""
    print("\nTesting player tracker...")
    from player_tracker import PlayerTracker
    tracker = PlayerTracker()
    
    # Test with mock detections
    detections = [
        {"bbox": [100, 100, 200, 300], "center": [150, 200], "confidence": 0.9},
        {"bbox": [300, 100, 400, 300], "center": [350, 200], "confidence": 0.85}
    ]
    
    tracks = tracker.update(detections)
    print(f"✅ Created {len(tracks)} tracks")
    return True


def test_video_info():
    """Test video info extraction (without actual video)."""
    print("\nTesting video processor...")
    from video_processor import VideoProcessor
    # Just test class instantiation
    print("✅ VideoProcessor class loaded")
    return True


def main():
    """Run all tests."""
    print("=" * 50)
    print("Ada2AI Backend Test Suite")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_yolo_init,
        test_tracker,
        test_video_info,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ {test.__name__} failed: {e}")
            failed += 1
    
    print("\n" + "=" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    print("=" * 50)
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
