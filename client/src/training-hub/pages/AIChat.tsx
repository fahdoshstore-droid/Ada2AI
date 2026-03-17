import { useState, useRef, useEffect } from "react";
import { Brain, Send, Trash2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
  lang?: "ar" | "en";
}

const suggestedPromptsAr = [
  "اقترح خطة تدريب للأسبوع القادم",
  "حلل أداء الفريق هذا الشهر",
  "ما هي أفضل تمارين اللياقة للمهاجمين؟",
  "كيف أحسّن تكتيكات الدفاع؟",
];

const suggestedPromptsEn = [
  "Suggest a training plan for next week",
  "Analyze team performance this month",
  "Best fitness drills for forwards?",
  "How to improve defensive tactics?",
];

const responsesAr: Record<string, string> = {
  default: "شكراً على سؤالك! بناءً على بيانات الفريق الحالية، أنصح بالتركيز على تمارين التحمل والتنسيق الجماعي. هل تريد خطة تفصيلية؟",
  training: "بناءً على أداء الأسبوع الماضي، إليك خطة التدريب المقترحة:\n\n**الاثنين:** تمارين لياقة بدنية (60 دقيقة)\n**الثلاثاء:** تكتيكات هجومية (90 دقيقة)\n**الأربعاء:** راحة نشطة\n**الخميس:** تدريب مهاري (75 دقيقة)\n**الجمعة:** مباراة تجريبية (90 دقيقة)",
  analysis: "تحليل أداء الفريق هذا الشهر:\n\n✅ **نقاط القوة:** السرعة في الهجوم المضاد، الضغط العالي\n⚠️ **نقاط التحسين:** الكرات الثابتة، التحمل في الشوط الثاني\n📈 **التقدم:** +12% في معدل الاستحواذ",
};

const responsesEn: Record<string, string> = {
  default: "Thanks for your question! Based on current team data, I recommend focusing on endurance and team coordination drills. Would you like a detailed plan?",
  training: "Based on last week's performance, here's the suggested training plan:\n\n**Monday:** Physical fitness (60 min)\n**Tuesday:** Offensive tactics (90 min)\n**Wednesday:** Active rest\n**Thursday:** Skills training (75 min)\n**Friday:** Practice match (90 min)",
  analysis: "Team performance analysis this month:\n\n✅ **Strengths:** Counter-attack speed, high press\n⚠️ **Improvements:** Set pieces, second-half endurance\n📈 **Progress:** +12% in possession rate",
};

export default function AIChat({ initialPrompt, onPromptConsumed, lang = "ar" }: AIChatProps) {
  const isRTL = lang === "ar";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const suggestedPrompts = isRTL ? suggestedPromptsAr : suggestedPromptsEn;
  const responses = isRTL ? responsesAr : responsesEn;

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      onPromptConsumed?.();
    }
  }, [initialPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getResponse = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("تدريب") || lower.includes("training") || lower.includes("plan")) return responses.training;
    if (lower.includes("تحليل") || lower.includes("أداء") || lower.includes("analysis") || lower.includes("performance")) return responses.analysis;
    return responses.default;
  };

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setMessages(prev => [...prev, { role: "assistant", content: getResponse(content) }]);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0D1220" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)" }}>
          <Brain size={18} color="#fff" />
        </div>
        <div>
          <div className="font-bold text-white text-sm"
            style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "مساعد التدريب الذكي" : "AI Training Assistant"}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "متصل" : "Online"}
            </span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="mr-auto ml-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ color: "rgba(238,239,238,0.4)", background: "rgba(255,255,255,0.04)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
          >
            <Trash2 size={13} />
            {lang === "ar" ? "مسح" : "Clear"}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(0,122,186,0.2), rgba(0,220,200,0.1))", border: "1px solid rgba(0,220,200,0.2)" }}>
              <Sparkles size={28} style={{ color: "#00DCC8" }} />
            </div>
            <div className="text-center">
              <div className="font-bold text-white mb-2"
                style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {lang === "ar" ? "كيف يمكنني مساعدتك اليوم؟" : "How can I help you today?"}
              </div>
              <div className="text-sm" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {lang === "ar" ? "اسألني عن التدريب، التكتيكات، أو تحليل الأداء" : "Ask me about training, tactics, or performance analysis"}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-4 py-2.5 rounded-xl text-sm text-right transition-all"
                  style={{
                    background: "rgba(0,220,200,0.06)",
                    border: "1px solid rgba(0,220,200,0.15)",
                    color: "rgba(238,239,238,0.7)",
                    fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? (isRTL ? "flex-row-reverse" : "flex-row-reverse") : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)" }}>
                <Brain size={14} color="#fff" />
              </div>
            )}
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap"
              style={{
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #007ABA, #00DCC8)"
                  : "rgba(255,255,255,0.05)",
                color: msg.role === "user" ? "#fff" : "rgba(238,239,238,0.85)",
                fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
                lineHeight: 1.7,
                borderRadius: msg.role === "user"
                  ? (isRTL ? "20px 4px 20px 20px" : "4px 20px 20px 20px")
                  : (isRTL ? "4px 20px 20px 20px" : "20px 4px 20px 20px"),
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)" }}>
              <Brain size={14} color="#fff" />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(j => (
                  <div key={j} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "#00DCC8", animationDelay: `${j * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0D1220" }}>
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={lang === "ar" ? "اكتب سؤالك هنا..." : "Type your question here..."}
            className="flex-1 px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
              direction: isRTL ? "rtl" : "ltr",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: input.trim() ? "linear-gradient(135deg, #007ABA, #00DCC8)" : "rgba(255,255,255,0.06)",
              color: input.trim() ? "#fff" : "rgba(238,239,238,0.3)",
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
