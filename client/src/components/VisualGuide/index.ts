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

export type { 
  GuideStep, 
  GuideSession, 
  VisualGuideProps, 
  GuideAction,
  GuideLevel,
} from './types';