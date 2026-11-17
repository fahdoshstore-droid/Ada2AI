/**
 * Deprecated. This panel was mounted nowhere and could never submit: its
 * holdoutPairs state had no setter, so canSubmitHoldout was permanently
 * false and validateHoldout always threw "Need at least 4 non-collinear
 * holdout correspondences". It also read pitch coordinates off a diagram by
 * eye in corner-origin 0..105 / 0..68, while the backend's PitchLandmarks
 * are metres from the centre spot.
 *
 * Use components/coach/PitchCalibrator instead: named landmarks, centre-origin
 * coordinates, leave-one-out validation, and the result persisted in
 * match_calibrations.
 */
export { default } from '../../components/coach/PitchCalibrator'
