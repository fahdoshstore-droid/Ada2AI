/**
 * VisualGuide - Arabic AI Teaching Overlay
 * 
 * Export all components and types for easy import
 */

// Main component
export { default as VisualGuide } from './VisualGuide';

// Types and utilities
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
export type {
  FormationAnalysis,
  PlayerAnalysis,
} from './AIGuidanceEngine';

// Highlight Overlay
export { default as HighlightOverlay } from './HighlightOverlay';
export { presetHighlights, createArrow } from './HighlightOverlay';
export type { HighlightZone, HighlightConfig, ArrowConfig, LabelGenerator } from './HighlightOverlay';

// Guide types
export type { 
  GuideStep, 
  GuideSession, 
  VisualGuideProps, 
  GuideAction,
  GuideLevel,
} from './types';