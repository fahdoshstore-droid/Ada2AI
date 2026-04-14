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