/**
 * Ada2AI Visual Guide - Arabic AI Teaching Overlay
 * 
 * A Clicky-inspired overlay that provides real-time Arabic guidance
 * for sports training on the Ada2AI platform.
 * 
 * Features:
 * - Arabic-first AI guidance
 * - Visual pointers and highlights
 * - Pitch/formation integration
 * - Learning progress tracking
 * 
 * Design Reference: Clicky (macOS app) + Ada2AI sports context
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type GuideLevel = 'beginner' | 'intermediate' | 'advanced';

export type GuideAction = 
  | 'point'      // Points at specific element
  | 'highlight'  // Highlights area on pitch
  | 'explain'    // Shows explanatory text
  | 'suggest'    // Makes recommendation
  | 'correct'    // Corrects mistake
  | 'praise';    // Positive reinforcement

export interface GuideStep {
  id: string;
  action: GuideAction;
  target?: string;           // CSS selector or element ID
  messageAr: string;         // Arabic message
  messageEn: string;         // English fallback
  duration?: number;         // Auto-advance after ms
  highlightColor?: string;   // Highlight color
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Eye integration: attach Eye actions to this guide step */
  eyeActions?: import('../Eye/types').EyeAction[];
}

export interface GuideSession {
  id: string;
  name: string;
  level: GuideLevel;
  steps: GuideStep[];
  completedSteps: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Arabic Guides
// ─────────────────────────────────────────────────────────────────────────────

export const formationGuideSteps: GuideStep[] = [
  {
    id: 'intro',
    action: 'explain',
    messageAr: 'مرحباً! أنا مدربك الذكي. سأساعدك في فهم التشكيل الأمثل.',
    messageEn: 'Hello! I am your AI coach. I will help you understand optimal formations.',
    duration: 4000,
  },
  {
    id: 'pitch-overview',
    action: 'highlight',
    target: '[data-pitch]',
    messageAr: 'هذه ملعب كرة القدم. سنتعلم كيف نضع اللاعبين في المواقع الصحيحة.',
    messageEn: 'This is the football pitch. We will learn how to place players in correct positions.',
    duration: 5000,
  },
  {
    id: 'defender-placement',
    action: 'point',
    target: '[data-role="DEF"]',
    messageAr: 'اضغط على مدافعي الفريق لأوضعهم في المواقع الدفاعية.',
    messageEn: 'Click on your defenders to place them in defensive positions.',
    highlightColor: '#3B82F6',
    arrowPosition: 'top',
  },
  {
    id: 'midfielder-placement',
    action: 'point',
    target: '[data-role="MID"]',
    messageAr: 'الآن ضع الوسطاء - هم حلقة الوصل بين الدفاع والهجوم.',
    messageEn: 'Now place the midfielders - they connect defense and attack.',
    highlightColor: '#22C55E',
    arrowPosition: 'bottom',
  },
  {
    id: 'striker-placement',
    action: 'suggest',
    target: '[data-role="FWD"]',
    messageAr: 'المهاجم يجب أن يكون في المقدمة، قرب منطقة الجزاء.',
    messageEn: 'The striker should be upfront, near the penalty area.',
    highlightColor: '#EF4444',
    arrowPosition: 'top',
  },
  {
    id: 'formation-complete',
    action: 'praise',
    messageAr: 'ممتاز! تشكيلتك جاهزة. اضغط حفظ لحفظ التشكيل.',
    messageEn: 'Excellent! Your formation is ready. Press Save to keep it.',
    duration: 4000,
  },
];

export const trainingGuideSteps: GuideStep[] = [
  {
    id: 'training-intro',
    action: 'explain',
    messageAr: 'سنتابع أداء اللاعبين خلال التدريب. انتبه للتعليمات.',
    messageEn: 'We will monitor player performance during training. Pay attention to instructions.',
    duration: 4000,
  },
  {
    id: 'speed-metric',
    action: 'point',
    target: '[data-metric="speed"]',
    messageAr: 'هذه قياس السرعة. كلما كان اللون أخضر داكن، كان الأداء أفضل.',
    messageEn: 'This is the speed metric. Darker green means better performance.',
    highlightColor: '#22C55E',
  },
  {
    id: 'technique-metric',
    action: 'point',
    target: '[data-metric="technique"]',
    messageAr: 'مهارة التمرير مهمة للوسطاء. ركز على هذا التمرين.',
    messageEn: 'Passing skill is important for midfielders. Focus on this drill.',
    highlightColor: '#3B82F6',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

export interface VisualGuideProps {
  /** Current guide session */
  session?: GuideSession;
  
  /** Current step index */
  currentStep?: number;
  
  /** Guide level */
  level?: GuideLevel;
  
  /** Is guide active */
  isActive?: boolean;
  
  /** Language preference */
  language?: 'ar' | 'en';
  
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /** Callback when step completes */
  onStepComplete?: (stepId: string) => void;
  
  /** Callback when guide finishes */
  onGuideComplete?: (sessionId: string) => void;
  
  /** Callback to skip guide */
  onSkip?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Props
// ─────────────────────────────────────────────────────────────────────────────

export const defaultGuideProps: Partial<VisualGuideProps> = {
  level: 'beginner',
  currentStep: 0,
  isActive: false,
  language: 'ar',
  position: 'bottom-right',
};

// ─────────────────────────────────────────────────────────────────────────────
// Guide Session Factory
// ─────────────────────────────────────────────────────────────────────────────

export function createFormationGuide(formation: string = "4-4-2", isRTL: boolean = false): GuideSession {
  return {
    id: `guide-${Date.now()}`,
    name: 'formation-basics',
    level: 'beginner',
    steps: formationGuideSteps,
    completedSteps: [],
  };
}

export function createTrainingGuide(): GuideSession {
  return {
    id: `guide-${Date.now()}`,
    name: 'training-basics', 
    level: 'beginner',
    steps: trainingGuideSteps,
    completedSteps: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlight Colors
// ─────────────────────────────────────────────────────────────────────────────

export const guideColors = {
  defender: '#3B82F6',   // Blue
  midfielder: '#22C55E', // Green
  forward: '#EF4444',    // Red
  goalkeeper: '#F59E0B', // Orange/Yellow
  highlight: 'rgba(0, 220, 200, 0.3)', // Teal overlay
  pointer: '#00DCC8',    // Ada2AI teal
};