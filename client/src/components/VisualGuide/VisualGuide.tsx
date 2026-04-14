/**
 * VisualGuide - Arabic AI Teaching Overlay
 * 
 * A Clicky-inspired component that provides real-time Arabic guidance
 * for sports training on the Ada2AI platform.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, Lightbulb, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import type { GuideStep, GuideSession, VisualGuideProps, GuideAction } from './types';
import { defaultGuideProps, guideColors, createFormationGuide } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Action Icons
// ─────────────────────────────────────────────────────────────────────────────

const actionIcons: Record<GuideAction, React.ReactNode> = {
  point: <Target size={16} />,
  highlight: <AlertCircle size={16} />,
  explain: <Lightbulb size={16} />,
  suggest: <Lightbulb size={16} />,
  correct: <AlertCircle size={16} />,
  praise: <CheckCircle2 size={16} />,
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

interface GuideBubbleProps {
  step: GuideStep;
  isRtl: boolean;
  onDismiss: () => void;
}

function GuideBubble({ step, isRtl, onDismiss }: GuideBubbleProps) {
  return (
    <div
      className="absolute z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Main bubble */}
      <div
        className="relative rounded-2xl p-4 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0D1220 0%, #1a1f2e 100%)',
          border: `1px solid ${guideColors.pointer}40`,
        }}
      >
        {/* Action indicator */}
        <div
          className="absolute -top-3 start-4 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold"
          style={{
            background: guideColors.pointer,
            color: '#0D1220',
          }}
        >
          {actionIcons[step.action]}
          <span>{isRtl ? step.messageAr : step.messageEn}</span>
        </div>

        {/* Message content */}
        <div className="mt-3">
          <p
            className="text-base font-semibold leading-relaxed"
            style={{
              color: '#fff',
              fontFamily: isRtl ? "'Tajawal', sans-serif" : "'Space Grotesk', sans-serif",
            }}
          >
            {isRtl ? step.messageAr : step.messageEn}
          </p>
        </div>

        {/* Arrow pointer */}
        {step.arrowPosition && (
          <div
            className={`absolute ${
              step.arrowPosition === 'top' ? '-top-3' :
              step.arrowPosition === 'bottom' ? '-bottom-3' :
              step.arrowPosition === 'left' ? '-start-3' : '-end-3'
            }`}
            style={{
              width: 0,
              height: 0,
              border: '8px solid transparent',
              ...(step.arrowPosition === 'top' && {
                borderBottom: `8px solid ${guideColors.pointer}`,
                top: '-16px',
              }),
              ...(step.arrowPosition === 'bottom' && {
                borderTop: `8px solid ${guideColors.pointer}`,
                bottom: '-16px',
              }),
              ...(step.arrowPosition === 'left' && {
                borderRight: `8px solid ${guideColors.pointer}`,
                left: '-16px',
              }),
              ...(step.arrowPosition === 'right' && {
                borderLeft: `8px solid ${guideColors.pointer}`,
                right: '-16px',
              }),
            }}
          />
        )}
      </div>
    </div>
  );
}

interface ProgressDotsProps {
  total: number;
  current: number;
  color: string;
}

function ProgressDots({ total, current, color }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-4' : 'w-1.5'
          }`}
          style={{
            background: i <= current ? color : 'rgba(255,255,255,0.2)',
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function VisualGuide({
  session,
  currentStep = 0,
  level = 'beginner',
  isActive = false,
  language = 'ar',
  position = 'bottom-right',
  onStepComplete,
  onGuideComplete,
  onSkip,
}: VisualGuideProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  const isRtl = language === 'ar';
  
  // Use session steps or defaults
  const steps = session?.steps || [createFormationGuide().steps[0]];
  const step = steps[currentStep];
  
  // Show/hide animation
  useEffect(() => {
    if (isActive) {
      setVisible(true);
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    } else {
      setAnimating(true);
      setTimeout(() => setVisible(false), 200);
    }
  }, [isActive]);
  
  // Auto-advance timer
  useEffect(() => {
    if (!isActive || !step?.duration) return;
    
    const timer = setTimeout(() => {
      handleNext();
    }, step.duration);
    
    return () => clearTimeout(timer);
  }, [isActive, currentStep, step?.duration]);
  
  const handleNext = useCallback(() => {
    if (onStepComplete && step) {
      onStepComplete(step.id);
    }
    
    if (currentStep >= steps.length - 1) {
      if (onGuideComplete && session) {
        onGuideComplete(session.id);
      }
    }
  }, [currentStep, steps.length, session, step, onStepComplete, onGuideComplete]);
  
  const handleDismiss = useCallback(() => {
    if (onSkip) {
      onSkip();
    }
  }, [onSkip]);
  
  // Position styles
  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' },
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' },
  };
  
  if (!visible) return null;
  
  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={positionStyles[position]}
    >
      <div
        className="relative rounded-2xl p-5 shadow-2xl min-w-72 max-w-96"
        style={{
          background: 'linear-gradient(135deg, #0D1220 0%, #151b28 100%)',
          border: '1px solid rgba(0, 220, 200, 0.2)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: guideColors.pointer, color: '#0D1220' }}
            >
              🐺
            </div>
            <div>
              <div
                className="text-sm font-bold"
                style={{ color: guideColors.pointer, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {isRtl ? 'مدربك الذكي' : 'AI Coach'}
              </div>
              <div
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: isRtl ? "'Tajawal', sans-serif" : 'inherit' }}
              >
                {isRtl ? 'مرشدك في الملعب' : 'Your guide on the pitch'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Guide Bubble */}
        {step && (
          <GuideBubble 
            step={step} 
            isRtl={isRtl} 
            onDismiss={handleDismiss} 
          />
        )}
        
        {/* Progress */}
        <ProgressDots 
          total={steps.length}
          current={currentStep}
          color={guideColors.pointer}
        />
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleDismiss}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ 
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {isRtl ? 'تخطي' : 'Skip'}
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              background: guideColors.pointer,
              color: '#0D1220',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {isRtl ? 'التالي' : 'Next'}
            <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Export all components and types
// ─────────────────────────────────────────────────────────────────────────────

export { defaultGuideProps, guideColors } from './types';
export type { GuideStep, GuideSession, VisualGuideProps, GuideAction, GuideLevel } from './types';