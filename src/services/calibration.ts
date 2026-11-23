/**
 * calibration.ts — turning pixels into metres.
 *
 * The problem this solves, precisely:
 *   backend/vision_core/graph.py:175 computes every distance as
 *     dist_px / 100.0  # Using ppm=100 as default
 *   so a track that walked across the frame is stored as 0.29 metres. Every
 *   distance, speed and acceleration in the product descends from that line.
 *
 *   The backend already has the real solver — backend/calibration/calibrator.py,
 *   368 lines, homography + holdout validation — and an endpoint at
 *   /calibration/manual. But the endpoint returns the result and stores
 *   nothing; CalibrationResult.to_dict() does not even include the matrix.
 *   So the homography is solved and discarded on every call.
 *
 * What this module does instead: solves the same homography in the browser,
 * stores it in match_calibrations, and recomputes distance from the
 * positional_history we already persist. No backend round-trip, so it works
 * with the vision service down — the same choice made for trackLinks.ts.
 *
 * Coordinate conventions, both load-bearing:
 *   image (u,v) are NORMALIZED to [0,1] against the frame, because
 *     analysis_data.graph.players[].positional_history is normalized too
 *     (graph.py writes x_norm/y_norm). Pixels would break silently the first
 *     time a frame arrived at a different resolution.
 *   pitch (X,Y) are METRES FROM THE CENTRE SPOT, matching PitchLandmarks in
 *     calibrator.py: X along the length (±52.5), Y across the width (±34).
 *     Corner-origin coordinates would yield a plausible-looking wrong matrix.
 */
import { supabase } from '../lib/supabase'

// FIFA standard, same constants as backend/calibration/calibrator.py
export const PITCH_LENGTH = 105
export const PITCH_WIDTH = 68
const HALF_L = PITCH_LENGTH / 2   // 52.5
const HALF_W = PITCH_WIDTH / 2    // 34
const PENALTY_DEPTH = 16.5
const PENALTY_HALF_WIDTH = 20.16
const CENTRE_CIRCLE_R = 9.15

export interface Landmark {
  key: string
  label: string        // Arabic, what the coach reads
  pitch: [number, number]
  /** false for the five landmarks the backend's PitchLandmarks lacks, so the
   *  divergence is visible rather than silent if the two ever get compared. */
  inBackend: boolean
}

export const LANDMARKS: Landmark[] = [
  // The seven the backend knows
  { key: 'top_left_corner', label: 'الزاوية اليسرى العليا', pitch: [-HALF_L, -HALF_W], inBackend: true },
  { key: 'top_right_corner', label: 'الزاوية اليمنى العليا', pitch: [HALF_L, -HALF_W], inBackend: true },
  { key: 'bottom_left_corner', label: 'الزاوية اليسرى السفلى', pitch: [-HALF_L, HALF_W], inBackend: true },
  { key: 'bottom_right_corner', label: 'الزاوية اليمنى السفلى', pitch: [HALF_L, HALF_W], inBackend: true },
  { key: 'center_spot', label: 'نقطة المنتصف', pitch: [0, 0], inBackend: true },
  { key: 'left_penalty_spot', label: 'نقطة الجزاء اليسرى', pitch: [-HALF_L + 11, 0], inBackend: true },
  { key: 'right_penalty_spot', label: 'نقطة الجزاء اليمنى', pitch: [HALF_L - 11, 0], inBackend: true },
  // Added here: a single broadcast camera rarely shows both corners and both
  // penalty spots at once, so with the backend's seven alone a coach often
  // cannot find four clickable points. These are standard FIFA positions.
  { key: 'left_penalty_area_top', label: 'زاوية منطقة الجزاء اليسرى العليا', pitch: [-HALF_L + PENALTY_DEPTH, -PENALTY_HALF_WIDTH], inBackend: false },
  { key: 'left_penalty_area_bottom', label: 'زاوية منطقة الجزاء اليسرى السفلى', pitch: [-HALF_L + PENALTY_DEPTH, PENALTY_HALF_WIDTH], inBackend: false },
  { key: 'right_penalty_area_top', label: 'زاوية منطقة الجزاء اليمنى العليا', pitch: [HALF_L - PENALTY_DEPTH, -PENALTY_HALF_WIDTH], inBackend: false },
  { key: 'right_penalty_area_bottom', label: 'زاوية منطقة الجزاء اليمنى السفلى', pitch: [HALF_L - PENALTY_DEPTH, PENALTY_HALF_WIDTH], inBackend: false },
  { key: 'halfway_top', label: 'طرف خط المنتصف الأعلى', pitch: [0, -HALF_W], inBackend: false },
  { key: 'halfway_bottom', label: 'طرف خط المنتصف الأسفل', pitch: [0, HALF_W], inBackend: false },
  { key: 'centre_circle_top', label: 'أعلى دائرة المنتصف', pitch: [0, -CENTRE_CIRCLE_R], inBackend: false },
  { key: 'centre_circle_bottom', label: 'أسفل دائرة المنتصف', pitch: [0, CENTRE_CIRCLE_R], inBackend: false },
]

export const landmarkByKey = new Map(LANDMARKS.map(l => [l.key, l]))

export interface Correspondence {
  landmark: string
  image_x: number   // normalized [0,1]
  image_y: number   // normalized [0,1]
  pitch_x: number   // metres from centre
  pitch_y: number
}

/** 3x3 row-major. */
export type Homography = number[]

export interface SolvedCalibration {
  homography: Homography
  /** Mean reprojection error over the points used to solve, in metres.
   *  Low on its own means little — four points always fit four points. */
  fitErrorMeters: number
  /** Worst leave-one-out error, in metres: solve without a point, then
   *  predict it. This is the number that says whether the matrix generalises.
   *  null when there are only four points, because removing one leaves three
   *  and a homography cannot be solved from three. */
  holdoutErrorMeters: number | null
  validated: boolean
  note: string
}

/** Solve A·x = b by Gaussian elimination with partial pivoting. */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) pivot = row
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null   // singular: collinear clicks
    ;[M[col], M[pivot]] = [M[pivot], M[col]]
    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const factor = M[row][col] / M[col][col]
      for (let k = col; k <= n; k++) M[row][k] -= factor * M[col][k]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

/**
 * Least-squares homography from >=4 correspondences, h33 fixed at 1.
 * Each point contributes two rows:
 *   u·h11 + v·h12 + h13 - uX·h31 - vX·h32 = X
 *   u·h21 + v·h22 + h23 - uY·h31 - vY·h32 = Y
 * Solved through the normal equations AᵀA·h = Aᵀb, as the Python fallback
 * _least_squares_homography does.
 */
function solveHomography(points: Correspondence[]): Homography | null {
  if (points.length < 4) return null
  const rows: number[][] = []
  const rhs: number[] = []
  for (const p of points) {
    const { image_x: u, image_y: v, pitch_x: X, pitch_y: Y } = p
    rows.push([u, v, 1, 0, 0, 0, -u * X, -v * X]); rhs.push(X)
    rows.push([0, 0, 0, u, v, 1, -u * Y, -v * Y]); rhs.push(Y)
  }
  // Normal equations
  const ATA: number[][] = Array.from({ length: 8 }, () => new Array(8).fill(0))
  const ATb: number[] = new Array(8).fill(0)
  for (let r = 0; r < rows.length; r++) {
    for (let i = 0; i < 8; i++) {
      ATb[i] += rows[r][i] * rhs[r]
      for (let j = 0; j < 8; j++) ATA[i][j] += rows[r][i] * rows[r][j]
    }
  }
  const h = solveLinearSystem(ATA, ATb)
  if (!h || h.some(value => !Number.isFinite(value))) return null
  return [...h, 1]
}

/** Map a normalized image point to pitch metres. */
export function imageToPitch(u: number, v: number, H: Homography): [number, number] | null {
  const w = H[6] * u + H[7] * v + H[8]
  if (Math.abs(w) < 1e-9) return null   // point on the horizon line
  return [(H[0] * u + H[1] * v + H[2]) / w, (H[3] * u + H[4] * v + H[5]) / w]
}

function meanError(points: Correspondence[], H: Homography): number {
  let sum = 0
  let counted = 0
  for (const p of points) {
    const projected = imageToPitch(p.image_x, p.image_y, H)
    if (!projected) continue
    sum += Math.hypot(projected[0] - p.pitch_x, projected[1] - p.pitch_y)
    counted++
  }
  return counted ? sum / counted : Number.POSITIVE_INFINITY
}

/** Error beyond this (metres) means the matrix should not be trusted. A metre
 *  and a half is about a player's width — past that, the player a position
 *  belongs to becomes a guess. */
export const HOLDOUT_TOLERANCE_METERS = 1.5

/** Above this reprojection error the projected positions are too far off to
 *  draw as a positioning map at all (a 3 m error moves a player across a
 *  penalty-box line). Between HOLDOUT_TOLERANCE_METERS and this the map is
 *  shown with the "unverified" badge; above it, PositionHeatmap refuses. */
export const MAX_HEATMAP_ERROR_METERS = 3

/**
 * Leave-one-out needs enough points that the reduced solve is still
 * constrained. Measured over 400 trials per row with synthetic perspective
 * and gaussian click noise on a 1280x720 frame:
 *
 *   points   click err   holdout median   passes the 1.5 m gate
 *      5       ±2 px        62.7 m             0 %
 *      6       ±2 px         3.3 m            14 %
 *      7       ±2 px         1.4 m            59 %
 *      8       ±2 px         1.2 m            77 %
 *      9       ±2 px         1.0 m            88 %
 *      7       ±1 px         0.7 m            99 %
 *
 * At five points, removing one leaves four — the bare minimum — so the
 * reduced homography is unconstrained and the held-out prediction explodes.
 * The 62.7 m is not a measurement of anything; reporting it as an error
 * figure would be worse than reporting nothing. Hence six as the floor, and
 * seven as what the coach is actually asked for.
 *
 * The other thing the table says: click precision dominates. Going from
 * ±2 px to ±1 px takes seven points from 59 % to 99 %. That is why a placed
 * point can be nudged with the arrow keys instead of only dragged.
 */
export const MIN_POINTS_FOR_HOLDOUT = 6
export const RECOMMENDED_POINTS = 7

export function calibrate(points: Correspondence[]): SolvedCalibration | null {
  const H = solveHomography(points)
  if (!H) return null

  const fitErrorMeters = meanError(points, H)
  if (!Number.isFinite(fitErrorMeters)) return null

  // Leave-one-out: the only check that distinguishes a real homography from
  // one that merely interpolates the clicks it was given.
  let holdoutErrorMeters: number | null = null
  if (points.length >= MIN_POINTS_FOR_HOLDOUT) {
    let worst = 0
    for (let i = 0; i < points.length; i++) {
      const subset = points.filter((_, index) => index !== i)
      const Hi = solveHomography(subset)
      if (!Hi) { worst = Number.POSITIVE_INFINITY; break }
      const projected = imageToPitch(points[i].image_x, points[i].image_y, Hi)
      if (!projected) { worst = Number.POSITIVE_INFINITY; break }
      worst = Math.max(worst, Math.hypot(projected[0] - points[i].pitch_x, projected[1] - points[i].pitch_y))
    }
    holdoutErrorMeters = Number.isFinite(worst) ? worst : null
  }

  const validated = holdoutErrorMeters !== null && holdoutErrorMeters <= HOLDOUT_TOLERANCE_METERS
  const note = validated
    ? `تم التحقق: أسوأ خطأ ${holdoutErrorMeters!.toFixed(2)} م على نقطة مستبعدة من الحساب`
    : holdoutErrorMeters === null
      ? `${points.length} نقاط: المصفوفة محسوبة لكن لا يمكن التحقق منها — التحقق يحتاج ${MIN_POINTS_FOR_HOLDOUT} نقاط على الأقل، و${RECOMMENDED_POINTS} للحصول على دقة متر واحد`
      : `غير متحقَّق: أسوأ خطأ ${holdoutErrorMeters.toFixed(2)} م يتجاوز الحد ${HOLDOUT_TOLERANCE_METERS} م`

  return { homography: H, fitErrorMeters, holdoutErrorMeters, validated, note }
}

// ── Recomputing distance from a stored calibration ──────────────────

export interface PositionSample { frame: number; x: number; y: number; timestamp?: number }

/** A human sprint tops out near 11 m/s. A recomputed step above this means the
 *  calibration or the tracking is wrong, and saying so beats printing it. */
export const IMPLAUSIBLE_SPEED_MPS = 12

export interface RecomputedTrack {
  distanceMeters: number
  topSpeedMps: number | null
  implausibleSteps: number
  steps: number
}

export function recomputeTrack(history: PositionSample[], H: Homography): RecomputedTrack | null {
  if (history.length < 2) return null
  let distanceMeters = 0
  let topSpeedMps: number | null = null
  let implausibleSteps = 0
  let steps = 0

  for (let i = 1; i < history.length; i++) {
    const a = imageToPitch(history[i - 1].x, history[i - 1].y, H)
    const b = imageToPitch(history[i].x, history[i].y, H)
    if (!a || !b) continue
    const step = Math.hypot(b[0] - a[0], b[1] - a[1])
    const seconds = (history[i].timestamp ?? 0) - (history[i - 1].timestamp ?? 0)
    if (seconds > 0) {
      const speed = step / seconds
      if (speed > IMPLAUSIBLE_SPEED_MPS) implausibleSteps++
      else topSpeedMps = Math.max(topSpeedMps ?? 0, speed)
    }
    distanceMeters += step
    steps++
  }
  return steps ? { distanceMeters, topSpeedMps, implausibleSteps, steps } : null
}

// ── Persistence ─────────────────────────────────────────────────────

export interface StoredCalibration {
  id: string
  analysis_id: string
  match_id: string | null
  correspondences: Correspondence[]
  homography: Homography
  reprojection_error_meters: number | null
  validated: boolean
  source: string
  frame_timestamp_seconds: number | null
  frame_video_url: string | null
  frame_label: string | null
  created_at: string
}

export async function getCalibration(analysisId: string): Promise<StoredCalibration | null> {
  const { data, error } = await supabase
    .from('match_calibrations')
    .select('*')
    .eq('analysis_id', analysisId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as StoredCalibration | null) ?? null
}

export interface SaveCalibrationInput {
  analysisId: string
  matchId: string | null
  correspondences: Correspondence[]
  solved: SolvedCalibration
  /** The moment in the video the coach clicked on, so the calibration can be
   *  re-opened against the same frame rather than being unreproducible. */
  frameTimestampSeconds?: number
  frameVideoUrl?: string | null
  frameLabel?: string
}

export async function saveCalibration(input: SaveCalibrationInput): Promise<StoredCalibration> {
  const { data: auth } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('match_calibrations')
    .upsert({
      analysis_id: input.analysisId,
      match_id: input.matchId,
      correspondences: input.correspondences,
      homography: input.solved.homography,
      // The holdout number is the honest one; fall back to the fit error only
      // when there are four points and no holdout is possible.
      reprojection_error_meters: input.solved.holdoutErrorMeters ?? input.solved.fitErrorMeters,
      validated: input.solved.validated,
      source: 'coach_manual',
      frame_timestamp_seconds: input.frameTimestampSeconds ?? null,
      frame_video_url: input.frameVideoUrl ?? null,
      frame_label: input.frameLabel ?? null,
      created_by: auth?.user?.id ?? null,
    }, { onConflict: 'analysis_id' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as StoredCalibration
}

// ── Reading the positions we already store ──────────────────────────

export interface TrackHistory {
  trackId: number
  team: number | null
  framesVisible: number
  /** What the database holds today: pixel distance / 100. */
  storedDistanceMeters: number
  history: PositionSample[]
}

/**
 * positional_history lives under analysis_data.graph.players — not under
 * analysis_data.players, which carries aggregates only. graph.py caps it at
 * the last 50 samples per track, so a recomputed distance covers that window,
 * not the whole match. Saying so beats quietly presenting a partial figure as
 * a match total.
 */
export async function getTrackHistories(analysisId: string): Promise<TrackHistory[]> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('analysis_data')
    .eq('id', analysisId)
    .single()
  if (error) throw new Error(error.message)

  const players = (data as { analysis_data?: { graph?: { players?: Record<string, unknown> } } })
    ?.analysis_data?.graph?.players
  if (!players || typeof players !== 'object') return []

  const out: TrackHistory[] = []
  for (const value of Object.values(players)) {
    const node = value as {
      track_id?: number; team?: number | null; frames_visible?: number
      total_distance_meters?: number; positional_history?: PositionSample[]
    }
    if (typeof node?.track_id !== 'number') continue
    out.push({
      trackId: node.track_id,
      team: node.team ?? null,
      framesVisible: node.frames_visible ?? 0,
      storedDistanceMeters: node.total_distance_meters ?? 0,
      history: Array.isArray(node.positional_history) ? node.positional_history : [],
    })
  }
  return out.sort((a, b) => b.framesVisible - a.framesVisible)
}

export const POSITIONAL_HISTORY_CAP = 50

/**
 * The analysis a calibration attaches to. One analysis per match in practice
 * (four analyses, four distinct matches), so the newest is the right one;
 * returning null rather than guessing when a match has none.
 */
export async function getPrimaryAnalysisId(matchId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('id')
    .eq('match_id', matchId)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throw new Error(error.message)
  return (data?.[0] as { id: string } | undefined)?.id ?? null
}

// ── The match video: what calibration is clicked on ─────────────────

/**
 * The videos bucket has existed since June and holds nothing; player-media
 * is empty too. No video has ever been uploaded through this product, which
 * is the root reason video_url and thumbnail_url are null on all four
 * analyses and why there was no frame to calibrate against. This writes to
 * the bucket named for the job.
 */
export const MATCH_VIDEO_BUCKET = 'videos'

export async function uploadMatchVideo(
  analysisId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const path = `match-analysis/${analysisId}/${Date.now()}_${file.name.replace(/[^\w.-]/g, '_')}`

  const { error: uploadError } = await supabase.storage
    .from(MATCH_VIDEO_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw new Error(uploadError.message)
  onProgress?.(1)

  const { data: urlData } = supabase.storage.from(MATCH_VIDEO_BUCKET).getPublicUrl(path)
  const publicUrl = urlData.publicUrl

  // Attach it to the analysis that already holds the tracks, rather than
  // creating a second analysis record the tracks do not belong to.
  const { error: updateError } = await supabase
    .from('video_analyses')
    .update({ video_url: publicUrl })
    .eq('id', analysisId)
  if (updateError) throw new Error(updateError.message)

  return publicUrl
}

export async function getAnalysisVideoUrl(analysisId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('video_url')
    .eq('id', analysisId)
    .single()
  if (error) throw new Error(error.message)
  return (data as { video_url: string | null }).video_url
}

// ── Positioning map ("خريطة التمركز") ────────────────────────────────
//
// positional_history is frame-normalized (x_norm = cx / frame_width, per
// vision_core/graph.py:138-139) — where the player sat IN THE CAMERA FRAME,
// not where he stood on the pitch. A heatmap built straight from that would
// show camera framing, not positioning, and silently mislabel one as the
// other the same way `dist_px / 100.0` silently mislabelled pixels as metres.
// This is why every point here is required to go through imageToPitch first.

export interface ProjectedPoint { x: number; y: number; timestamp?: number }

export function projectHistory(history: PositionSample[], H: Homography): { points: ProjectedPoint[]; dropped: number } {
  const points: ProjectedPoint[] = []
  let dropped = 0
  for (const sample of history) {
    const projected = imageToPitch(sample.x, sample.y, H)
    // A small overrun past the touchline is normal camera/click error; a
    // large one means the point is not trustworthy and is dropped rather
    // than clamped onto the pitch where it would misrepresent a position.
    const OVERRUN = 5
    if (!projected || Math.abs(projected[0]) > HALF_L + OVERRUN || Math.abs(projected[1]) > HALF_W + OVERRUN) {
      dropped++
      continue
    }
    points.push({ x: projected[0], y: projected[1], timestamp: sample.timestamp })
  }
  return { points, dropped }
}

/**
 * Below this many points, a density grid shows mostly empty cells and one or
 * two bright squares — a false impression of coverage. The real honesty here
 * is frame_stride: the recorded analysis sampled one frame every 30 (2.63 s
 * of CPU time over 120 frames), so a 9-track match held 2 to 5 positions per
 * track. Below the threshold the UI shows the actual points, not a grid.
 */
export const SPARSE_POINTS_THRESHOLD = 15

export interface DensityGrid {
  cols: number
  rows: number
  /** counts[row][col], row 0 = far touchline (pitch_y = -HALF_W) */
  counts: number[][]
  maxCount: number
}

export function buildDensityGrid(points: ProjectedPoint[], cols = 12, rows = 18): DensityGrid {
  const counts: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0))
  for (const p of points) {
    const col = Math.min(cols - 1, Math.max(0, Math.floor(((p.y + HALF_W) / PITCH_WIDTH) * cols)))
    const row = Math.min(rows - 1, Math.max(0, Math.floor(((p.x + HALF_L) / PITCH_LENGTH) * rows)))
    counts[row][col]++
  }
  const maxCount = Math.max(1, ...counts.flat())
  return { cols, rows, counts, maxCount }
}
