/**
 * AIGuidanceEngine - Smart formation analysis and suggestions
 * 
 * Analyzes current formation and generates intelligent Arabic guidance
 * for coaches and players.
 */

import type { PlayerRole } from '@/training-hub/pages/CoachDashboard.types';
import type { GuideStep } from './types';

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
  players: Array<{ role: PlayerRole; number: number; nameAr?: string }>
): GuideStep[] {
  const steps: GuideStep[] = [];
  
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
// Export all functions
// ─────────────────────────────────────────────────────────────────────────────

export default {
  analyzeFormation,
  generateGuideStepsFromAnalysis,
  getPlayerGuidance,
};