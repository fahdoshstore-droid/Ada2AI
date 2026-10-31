const EXERCISE_VISUALS: Record<string, string> = {
  "Bench Press": "/exercises/01-bench-press.svg",
  "Incline Barbell Bench Press": "/exercises/02-incline-barbell-bench-press.svg",
  "Decline Barbell Bench Press": "/exercises/03-decline-barbell-bench-press.svg",
  "Flat Dumbbell Fly": "/exercises/04-flat-dumbbell-fly.svg",
  "Flat Dumbbell Bench Press": "/exercises/05-flat-dumbbell-bench-press.svg",
  "Reverse-Grip Cable Triceps Pushdown": "/exercises/06-reverse-grip-cable-triceps-pushdown.svg",
  "Bench Dips": "/exercises/07-bench-dips.svg",
  "Parallel Bar Dips": "/exercises/08-parallel-bar-dips.svg",
  "Pull-up": "/exercises/09-pull-up.svg",
  "One-Arm Dumbbell Row": "/exercises/10-one-arm-dumbbell-row.svg",
  "Cable Row": "/exercises/11-cable-row.svg",
  "Standing Barbell Row": "/exercises/12-standing-barbell-row.svg",
  "Wide-Grip Front Lat Pulldown": "/exercises/13-wide-grip-front-lat-pulldown.svg",
  "Standing Barbell Curl": "/exercises/14-standing-barbell-curl.svg",
  "EZ-Bar Preacher Curl": "/exercises/15-ez-bar-preacher-curl.svg",
  "Incline Dumbbell Curl": "/exercises/16-incline-dumbbell-curl.svg",
  "Concentration Dumbbell Curl": "/exercises/17-concentration-dumbbell-curl.svg",
  "Machine Shoulder Press": "/exercises/18-machine-shoulder-press.svg",
  "Rear Delt Dumbbell Raise": "/exercises/19-rear-delt-dumbbell-raise.svg",
  "Standing Barbell Shoulder Press": "/exercises/20-standing-barbell-shoulder-press.svg",
  "Lateral Raise": "/exercises/21-lateral-raise.svg",
  "Dumbbell Shrug": "/exercises/22-dumbbell-shrug.svg",
  "Standing Barbell Shrug": "/exercises/23-standing-barbell-shrug.svg",
  "Wrist Curl": "/exercises/24-wrist-curl.svg",
  "Reverse Wrist Curl": "/exercises/25-reverse-wrist-curl.svg",
  "Barbell Squat": "/exercises/26-barbell-squat.svg",
  "Leg Extension": "/exercises/27-leg-extension.svg",
  "Lying Leg Curl": "/exercises/28-lying-leg-curl.svg",
  "Standing Calf Raise": "/exercises/29-standing-calf-raise.svg",
  "Seated Calf Raise": "/exercises/30-seated-calf-raise.svg",
};

export function exerciseVisualPath(name: string | null | undefined): string | null {
  if (!name) return null;
  return EXERCISE_VISUALS[name] ?? null;
}
