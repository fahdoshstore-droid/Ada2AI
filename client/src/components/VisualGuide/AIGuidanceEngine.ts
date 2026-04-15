/**
 * AIGuidanceEngine - Smart formation analysis and suggestions
 * 
 * Analyzes current formation and generates intelligent Arabic guidance
 * for coaches and players.
 */

import type { PlayerRole } from '@/training-hub/pages/CoachDashboard.types';
import type { GuideStep } from './types';
import type { VisionAnalysisResult, EyeAction } from '../Eye/types';

// ─────────────────────────────────────────────────────────────────────────────
// Formation Analysis Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FormationAnalysis {
  strength: 'weak' | 'balanced' | 'strong';
  balance: {
    defense: number;  // 0-100
    midfield: number; // 0-100
    attack: number;  // 0-100
  };
  weaknesses: string[];
  suggestions: string[];
  optimalPositions: string[];
}

export interface PlayerAnalysis {
  id: number;
  role: PlayerRole;
  optimalRole?: PlayerRole;
  rating: number;
  suggestions: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Formation Analysis
// ─────────────────────────────────────────────────────────────────────────────

export function analyzeFormation(
  players: Array<{ role: PlayerRole; rating: number; number: number; nameAr?: string }>
): FormationAnalysis {
  // Count players by role
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  let defenseRating = 0;
  let midfieldRating = 0;
  let attackRating = 0;
  
  players.forEach(p => {
    counts[p.role]++;
    if (p.role === 'DEF') defenseRating += p.rating;
    if (p.role === 'MID') midfieldRating += p.rating;
    if (p.role === 'FWD') attackRating += p.rating;
  });
  
  // Calculate balance percentages
  const total = players.length || 1;
  const defensePct = (counts.DEF / total) * 100;
  const midfieldPct = (counts.MID / total) * 100;
  const attackPct = (counts.FWD / total) * 100;
  
  // Determine strengths/weaknesses
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  
  if (counts.DEF < 3) {
    weaknesses.push('الدفاع ضعيف - تحتاج على الأقل 3 مدافعين');
    suggestions.push('أضف مدافع إضافي لحماية المرمى');
  }
  
  if (counts.MID < 2) {
    weaknesses.push('الوسط ضعيف - صلة وصل ضعيفة بين الدفاع والهجوم');
    suggestions.push('قوي خط الوسط بلاعب آخر');
  }
  
  if (counts.FWD < 1) {
    weaknesses.push('لا يوجد مهاجم - خط الهجوم ضعيف');
    suggestions.push('أضف مهاجم لتغطية خط الهجوم');
  }
  
  if (defenseRating < 200) {
    suggestions.push('رفع مستوى المدافعين يقلل فرص الاستقبال');
  }
  
  if (attackRating < 150) {
    suggestions.push('تحسين خط الهجوم يزيد فرص التسجيل');
  }
  
  // Determine overall strength
  let strength: 'weak' | 'balanced' | 'strong' = 'balanced';
  if (weaknesses.length >= 2 || defenseRating < 150 || attackRating < 120) {
    strength = 'weak';
  } else if (defenseRating > 280 && attackRating > 200 && midfieldRating > 200) {
    strength = 'strong';
  }
  
  return {
    strength,
    balance: {
      defense: Math.min(100, defenseRating / 2),
      midfield: Math.min(100, midfieldRating / 2),
      attack: Math.min(100, attackRating / 2),
    },
    weaknesses,
    suggestions,
    optimalPositions: generateOptimalPositions(counts),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Optimal Positions
// ─────────────────────────────────────────────────────────────────────────────

function generateOptimalPositions(counts: Record<PlayerRole, number>): string[] {
  const positions: string[] = [];
  
  if (counts.GK >= 1) {
    positions.push('حارس المرمى يجب أن يكون في منتصف خط النهاية');
  }
  
  if (counts.DEF >= 4) {
    positions.push('استخدم مدافعين على الجانبين لتغطية العرض');
  } else if (counts.DEF >= 3) {
    positions.push('ثلاثي دفاعي يغطي المنتصف والأطراف');
  } else if (counts.DEF >= 2) {
    positions.push('ثنائي دفاعي يغطي المنتصف');
  }
  
  if (counts.MID >= 4) {
    positions.push('خط وسط رباعي يتحكم في اللعبة');
  } else if (counts.MID >= 3) {
    positions.push('ثلاثة وسطاء يضغطون على الخصم');
  } else if (counts.MID >= 2) {
    positions.push('ثنائي وسط يربط اللعب');
  }
  
  if (counts.FWD >= 2) {
    positions.push('ثنائي هجومي يضغط على الدفاع');
  } else if (counts.FWD >= 1) {
    positions.push('مهاجم واحد يتقدم للهجوم');
  }
  
  return positions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Guide Steps from Analysis
// ─────────────────────────────────────────────────────────────────────────────

export function generateGuideStepsFromAnalysis(
  analysis: FormationAnalysis,
  players: Array<{ role: PlayerRole; number: number; nameAr?: string }>,
  eyeContext?: { transcript?: string; visionResult?: VisionAnalysisResult }
): GuideStep[] {
  const steps: GuideStep[] = [];

  // Eye integration: prepend voice-driven steps if transcript provided
  if (eyeContext?.transcript) {
    const voiceSteps = parseTranscriptToSteps(eyeContext.transcript, analysis);
    steps.push(...voiceSteps);
  }

  // Eye integration: add vision-driven steps if Claude Vision result provided
  if (eyeContext?.visionResult) {
    const visionSteps = parseVisionToSteps(eyeContext.visionResult, players);
    steps.push(...visionSteps);
  }

  // Introduction
  steps.push({
    id: 'intro-analysis',
    action: 'explain',
    messageAr: `تحليل التشكيل الحالي:`,
    messageEn: `Analyzing current formation:`,
    duration: 2000,
  });
  
  // Balance overview
  if (analysis.strength === 'weak') {
    steps.push({
      id: 'weak-balance',
      action: 'correct',
      messageAr: `تشكيلتك تحتاج تحسين.الدفاع: ${Math.round(analysis.balance.defense)}% | الوسط: ${Math.round(analysis.balance.midfield)}% | الهجوم: ${Math.round(analysis.balance.attack)}%`,
      messageEn: `Your formation needs improvement. Defense: ${Math.round(analysis.balance.defense)}% | Midfield: ${Math.round(analysis.balance.midfield)}% | Attack: ${Math.round(analysis.balance.attack)}%`,
      highlightColor: '#EF4444',
      duration: 4000,
    });
  } else if (analysis.strength === 'balanced') {
    steps.push({
      id: 'balanced',
      action: 'praise',
      messageAr: `تشكيلتك متوازنة!دفاع: ${Math.round(analysis.balance.defense)}% | وسط: ${Math.round(analysis.balance.midfield)}% | هجوم: ${Math.round(analysis.balance.attack)}%`,
      messageEn: `Your formation is balanced! Defense: ${Math.round(analysis.balance.defense)}% | Midfield: ${Math.round(analysis.balance.midfield)}% | Attack: ${Math.round(analysis.balance.attack)}%`,
      highlightColor: '#22C55E',
      duration: 4000,
    });
  } else {
    steps.push({
      id: 'strong-formation',
      action: 'praise',
      messageAr: `تشكيلتك قوية!Maintain this setup for maximum effectiveness.`,
      messageEn: `Your formation is strong! Maintain this setup for maximum effectiveness.`,
      highlightColor: '#22C55E',
      duration: 4000,
    });
  }
  
  // Weaknesses
  analysis.weaknesses.forEach((weakness, i) => {
    steps.push({
      id: `weakness-${i}`,
      action: 'correct',
      messageAr: weakness,
      messageEn: weakness.replace(/[ئابةتثجحخدذرزسشصضطظعغفقكلمنهوي]/g, (c) => {
        // Just return as-is for English fallback
        return c;
      }),
      duration: 3000,
    });
  });
  
  // Suggestions
  analysis.suggestions.forEach((suggestion, i) => {
    steps.push({
      id: `suggestion-${i}`,
      action: 'suggest',
      messageAr: suggestion,
      messageEn: suggestion,
      highlightColor: '#00DCC8',
      duration: 3500,
    });
  });
  
  // Optimal positions
  if (analysis.optimalPositions.length > 0) {
    steps.push({
      id: 'optimal-positions',
      action: 'explain',
      messageAr: `المواقع المثلى: ${analysis.optimalPositions.join(' | ')}`,
      messageEn: `Optimal positions: ${analysis.optimalPositions.join(' | ')}`,
      duration: 4000,
    });
  }
  
  // Final encouragement
  steps.push({
    id: 'final',
    action: 'praise',
    messageAr: 'ممتاز! الآن التشكيل جاهز. اضغط حفظ للمتابعة.',
    messageEn: 'Excellent! Your formation is ready. Press Save to continue.',
    duration: 3000,
  });
  
  return steps;
}

// ─────────────────────────────────────────────────────────────────────────────
// Player-specific Guidance
// ─────────────────────────────────────────────────────────────────────────────

export function getPlayerGuidance(
  player: { role: PlayerRole; rating: number; number: number; nameAr?: string },
  analysis: FormationAnalysis
): string[] {
  const guidance: string[] = [];
  
  // Role-specific advice
  switch (player.role) {
    case 'GK':
      if (player.rating < 70) {
        guidance.push('حارس المستوى يحتاج تحسن فيركز على ردود الفعل');
      }
      guidance.push('ابقَ دائماً بين الكرة والمرمى');
      break;
      
    case 'DEF':
      if (analysis.balance.defense < 50) {
        guidance.push('الخط الدفاعي يحتاج دعم أكبر');
      }
      guidance.push('راقب تمريرات الخصم وأغلق المسارات');
      break;
      
    case 'MID':
      if (analysis.balance.midfield < 50) {
        guidance.push('خط الوسط ضعيف - زود التمريرات القصيرة');
      }
      guidance.push(' كن حلقة وصل بين الدفاع والهجوم');
      guidance.push('رقّب المساحات الفارغة للتحرك إليها');
      break;
      
    case 'FWD':
      if (analysis.balance.attack < 50) {
        guidance.push('خط الهجوم يحتاج دعم أكبر من الوسط');
      }
      guidance.push('ابقَ في المناطق الخطرة وجاهز للتسديد');
      guidance.push('راقب حركات زملائك للف pass');
      break;
  }
  
  return guidance;
}

// ─────────────────────────────────────────────────────────────────────────────
// Eye Integration: Parse voice transcript into guide steps
// ─────────────────────────────────────────────────────────────────────────────

const ARABIC_FORMATION_KEYWORDS: Record<string, PlayerRole[]> = {
  'مدافع': ['DEF'],
  'دفاع': ['DEF'],
  'مدافعين': ['DEF'],
  'وسط': ['MID'],
  'وسطاء': ['MID'],
  'مهاجم': ['FWD'],
  'هجوم': ['FWD'],
  'مهاجمين': ['FWD'],
  'حارس': ['GK'],
  'حارس المرمى': ['GK'],
  'تشكيل': [],
  '4-4-2': [],
  '4-3-3': [],
  '3-5-2': [],
};

function parseTranscriptToSteps(
  transcript: string,
  analysis: FormationAnalysis
): GuideStep[] {
  const steps: GuideStep[] = [];
  const lowerTranscript = transcript.toLowerCase();

  // Check for formation keywords
  for (const [keyword, roles] of Object.entries(ARABIC_FORMATION_KEYWORDS)) {
    if (lowerTranscript.includes(keyword)) {
      if (roles.length > 0) {
        steps.push({
          id: `voice-${keyword}-${Date.now()}`,
          action: 'point',
          target: roles.map(r => `[data-role="${r}"]`).join(', '),
          messageAr: `تحدثت عن ${keyword}. دعني أوضح لك.`,
          messageEn: `You mentioned ${keyword}. Let me explain.`,
          duration: 3000,
          highlightColor: '#00DCC8',
          eyeActions: [{
            id: `eye-voice-${Date.now()}`,
            type: 'speak',
            payload: {},
            messageAr: `تحدثت عن ${keyword}. دعني أوضح لك المناطق المتعلقة.`,
            messageEn: `You mentioned ${keyword}. Let me highlight the relevant areas.`,
          }],
        });
      }
    }
  }

  // If no keywords matched, add a generic voice step
  if (steps.length === 0) {
    steps.push({
      id: `voice-generic-${Date.now()}`,
      action: 'explain',
      messageAr: `سمعت: "${transcript.slice(0, 50)}${transcript.length > 50 ? '...' : ''}"`,
      messageEn: `I heard: "${transcript.slice(0, 50)}${transcript.length > 50 ? '...' : ''}"`,
      duration: 3000,
      eyeActions: [{
        id: `eye-voice-generic-${Date.now()}`,
        type: 'speak',
        payload: {},
        messageAr: 'تم استلام طلبك. سأحلل الشاشة الآن.',
        messageEn: 'Request received. Analyzing the screen now.',
      }],
    });
  }

  return steps;
}

function parseVisionToSteps(
  visionResult: VisionAnalysisResult,
  players: Array<{ role: PlayerRole; number: number; nameAr?: string }>
): GuideStep[] {
  const steps: GuideStep[] = [];

  // Add description step
  if (visionResult.descriptionAr) {
    steps.push({
      id: `vision-desc-${Date.now()}`,
      action: 'explain',
      messageAr: visionResult.descriptionAr,
      messageEn: visionResult.description,
      duration: 4000,
      eyeActions: [{
        id: `eye-vision-desc-${Date.now()}`,
        type: 'speak',
        payload: {},
        messageAr: visionResult.descriptionAr,
        messageEn: visionResult.description,
      }],
    });
  }

  // Add point steps for detected objects/players
  for (const obj of visionResult.objects) {
    const matchingRole = findMatchingRole(obj.labelAr || obj.label, players);
    steps.push({
      id: `vision-obj-${obj.labelAr || obj.label}-${Date.now()}`,
      action: matchingRole ? 'point' : 'highlight',
      target: matchingRole ? `[data-role="${matchingRole}"]` : undefined,
      messageAr: obj.labelAr || obj.label,
      messageEn: obj.label,
      duration: 2500,
      highlightColor: obj.confidence > 0.8 ? '#22C55E' : '#F59E0B',
      eyeActions: obj.bbox ? [{
        id: `eye-obj-${Date.now()}`,
        type: 'point',
        payload: {
          x: obj.bbox.x + (obj.bbox.w / 2),
          y: obj.bbox.y + (obj.bbox.h / 2),
          unit: 'percent' as const,
        },
        messageAr: obj.labelAr || obj.label,
        messageEn: obj.label,
      }] : [],
    });
  }

  // Add suggestion steps
  for (const suggestion of (visionResult.suggestionsAr || visionResult.suggestions)) {
    steps.push({
      id: `vision-sug-${Date.now()}-${suggestion.slice(0, 10)}`,
      action: 'suggest',
      messageAr: suggestion,
      messageEn: visionResult.suggestions[visionResult.suggestionsAr?.indexOf(suggestion)] || suggestion,
      duration: 3500,
      highlightColor: '#00DCC8',
    });
  }

  return steps;
}

function findMatchingRole(
  label: string,
  players: Array<{ role: PlayerRole; number: number; nameAr?: string }>
): PlayerRole | null {
  const lowerLabel = label.toLowerCase();

  // Check Arabic role names
  if (lowerLabel.includes('حارس') || lowerLabel.includes('gk')) return 'GK';
  if (lowerLabel.includes('مدافع') || lowerLabel.includes('def')) return 'DEF';
  if (lowerLabel.includes('وسط') || lowerLabel.includes('mid')) return 'MID';
  if (lowerLabel.includes('مهاجم') || lowerLabel.includes('fwd')) return 'FWD';

  // Check player names
  for (const player of players) {
    if (player.nameAr && lowerLabel.includes(player.nameAr.toLowerCase())) {
      return player.role;
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Export all functions
// ─────────────────────────────────────────────────────────────────────────────

export default {
  analyzeFormation,
  generateGuideStepsFromAnalysis,
  getPlayerGuidance,
};