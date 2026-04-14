/**
 * VisualGuide - Arabic AI Teaching Overlay
 * 
 * Export all components and types for easy import
 */

export { default as VisualGuide } from './VisualGuide';
export { 
  defaultGuideProps,
  guideColors,
  createFormationGuide,
  createTrainingGuide,
} from './types';

// AI Guidance Engine
export {
  analyzeFormation,
  generateGuideStepsFromAnalysis,
  getPlayerGuidance,
} from './AIGuidanceEngine';

// Highlight Overlay
export { default as HighlightOverlay } from './HighlightOverlay';
export { presetHighlights, createArrow } from './HighlightOverlay';
export type { HighlightZone, HighlightConfig, ArrowConfig } from './HighlightOverlay';

export type { 
  GuideStep, 
  GuideSession, 
  VisualGuideProps, 
  GuideAction,
  GuideLevel,
  FormationAnalysis,
  PlayerAnalysis,
} from './types';

export type {
  FormationAnalysis as AIGuidanceResult,
  PlayerAnalysis,
} from './AIGuidanceEngine';