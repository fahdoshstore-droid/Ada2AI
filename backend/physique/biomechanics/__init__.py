"""Ada2Physique biomechanics — Phase 2 exercise movement rules (forward-compatible stub).

Phase 1 ships only the rule registry (data contract) so the schema's
``physique_exercise_library.movement_rule_key`` and the video pipeline have a
stable target. Phase 2 implements ``MovementRule`` for each of the 15 supported
exercises on top of Ada2AI's ``vision_core`` (YOLO11 + MediaPipe Pose).
"""
from .registry import MOVEMENT_RULES, MovementRuleKey, get_rule
