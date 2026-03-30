/**
 * Training Hub — AI Chat
 * Design: Dark Sports-Tech (#0A0E1A, #00D4FF, #00FF88)
 * Features: Streaming animation, Streamdown markdown, bilingual
 */

import { useState, useRef, useEffect } from "react";
import { Brain, Send, User, Zap, Target, TrendingUp, Shield, Trash2 } from "lucide-react";
import { Streamdown } from "streamdown";

interface AIChatProps {
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
  lang?: "ar" | "en";
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_AR = [
  { icon: Zap, text: "خطة تدريب أسبوعية للمهاجمين", color: "#00FF88" },
  { icon: Target, text: "تمارين لتحسين الدقة في التسديد", color: "#FF6B35" },
  { icon: TrendingUp, text: "كيف أرفع مستوى اللياقة البدنية؟", color: "#00D4FF" },
  { icon: Shield, text: "تكتيكات دفاعية للمباريات الكبيرة", color: "#A78BFA" },
];

const SUGGESTED_EN = [
  { icon: Zap, text: "Weekly training plan for forwards", color: "#00FF88" },
  { icon: Target, text: "Drills to improve shooting accuracy", color: "#FF6B35" },
  { icon: TrendingUp, text: "How to improve physical fitness?", color: "#00D4FF" },
  { icon: Shield, text: "Defensive tactics for big matches", color: "#A78BFA" },
];

const RESPONSES_AR: Record<string, string> = {
  default: "شكراً على سؤالك! بناءً على بيانات الفريق الحالية، أنصح بالتركيز على تمارين التحمل والتنسيق الجماعي.\n\n**توصياتي الرئيسية:**\n1. زيادة جلسات التدريب الأسبوعية إلى 5 جلسات\n2. التركيز على التمارين التقنية الفردية\n3. إضافة جلسات تحليل فيديو للفريق\n\nهل تريد خطة تفصيلية لأي من هذه النقاط؟",
  training: "بناءً على أداء الأسبوع الماضي، إليك خطة التدريب المقترحة:\n\n**الاثنين:** تمارين لياقة بدنية (60 دقيقة)\n**الثلاثاء:** تكتيكات هجومية (90 دقيقة)\n**الأربعاء:** راحة نشطة + تمدد\n**الخميس:** تدريب مهاري (75 دقيقة)\n**الجمعة:** مباراة تجريبية (90 دقيقة)\n\n> ملاحظة: تأكد من الإحماء لمدة 15 دقيقة قبل كل جلسة",
  analysis: "تحليل أداء الفريق هذا الشهر:\n\n✅ **نقاط القوة:**\n- السرعة في الهجوم المضاد (+18%)\n- الضغط العالي والاسترداد السريع\n- دقة التمرير في الثلث الأخير\n\n⚠️ **نقاط التحسين:**\n- الكرات الثابتة (تحتاج تدريباً مكثفاً)\n- التحمل في الشوط الثاني\n\n📈 **التقدم الإجمالي:** +12% مقارنة بالشهر الماضي",
};

const RESPONSES_EN: Record<string, string> = {
  default: "Thanks for your question! Based on current team data, I recommend focusing on endurance and team coordination.\n\n**Key recommendations:**\n1. Increase weekly training sessions to 5\n2. Focus on individual technical drills\n3. Add video analysis sessions for the team\n\nWould you like a detailed plan for any of these points?",
  training: "Based on last week's performance, here's the suggested training plan:\n\n**Monday:** Physical fitness (60 min)\n**Tuesday:** Offensive tactics (90 min)\n**Wednesday:** Active rest + stretching\n**Thursday:** Skills training (75 min)\n**Friday:** Practice match (90 min)\n\n> Note: Ensure 15-minute warm-up before each session",
  analysis: "Team performance analysis this month:\n\n✅ **Strengths:**\n- Counter-attack speed (+18%)\n- High press and quick recovery\n- Passing accuracy in the final third\n\n⚠️ **Improvements needed:**\n- Set pieces (needs intensive training)\n- Second-half endurance\n\n📈 **Overall progress:** +12% vs last month",
};

export default function AIChat({ initialPrompt, onPromptConsumed, lang = "ar" }: AIChatProps) {
  const isRTL = lang === "ar";
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggested = lang === "ar" ? SUGGESTED_AR : SUGGESTED_EN;
  const responses = lang === "ar" ? RESPONSES_AR : RESPONSES_EN;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      onPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const getResponse = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("تدريب") || lower.includes("training") || lower.includes("plan") || lower.includes("خطة")) return responses.training;
    if (lower.includes("تحليل") || lower.includes("أداء") || lower.includes("analysis") || lower.includes("performance")) return responses.analysis;
    return responses.default;
  };

  const handleSend = async (text?: string) => {
    const content = text || inputValue.trim();
    if (!content || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setStreamingContent("");

    // Simulate streaming response
    await new Promise((r) => setTimeout(r, 600));
    const fullResponse = getResponse(content);
    setIsLoading(false);

    let i = 0;
    const interval = setInterval(() => {
      i += 4;
      setStreamingContent(fullResponse.slice(0, i));
      if (i >= fullResponse.length) {
        clearInterval(interval);
        setStreamingContent("");
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fullResponse,
            timestamp: new Date(),
          },
        ]);
      }
    }, 20);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#0A0E1A" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,212,255,0.1)", background: "#0D1526" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1))",
            border: "1px solid rgba(0,212,255,0.3)",
          }}
        >
          <Brain size={20} style={{ color: "#00D4FF" }} />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-sm" style={{ color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
            Ada2ai
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00FF88" }} />
            <span className="text-xs" style={{ color: "#00FF88", fontFamily: "'Cairo', sans-serif" }}>
              {lang === "ar" ? "متصل • جاهز للمساعدة" : "Online • Ready to help"}
            </span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
            style={{
              color: "rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.04)",
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            <Trash2 size={13} />
            {lang === "ar" ? "مسح" : "Clear"}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Empty state with suggested prompts */}
        {messages.length === 0 && !isLoading && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1))",
                border: "1px solid rgba(0,212,255,0.3)",
              }}
            >
              <Brain size={28} style={{ color: "#00D4FF" }} />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar" ? "كيف يمكنني مساعدتك اليوم؟" : "How can I help you today?"}
              </h3>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar"
                  ? "اسألني عن التدريب، التكتيكات، أو تحليل الأداء"
                  : "Ask me about training, tactics, or performance analysis"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {suggested.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSend(s.text)}
                    className="flex items-center gap-2 p-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: `${s.color}08`,
                      border: `1px solid ${s.color}20`,
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "'Cairo', sans-serif",
                      textAlign: isRTL ? "right" : "left",
                    }}
                  >
                    <Icon size={14} style={{ color: s.color, flexShrink: 0 }} />
                    {s.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages list */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? (isRTL ? "flex-row-reverse" : "flex-row-reverse") : ""}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={
                msg.role === "assistant"
                  ? { background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }
                  : { background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }
              }
            >
              {msg.role === "assistant" ? (
                <Brain size={14} style={{ color: "#00D4FF" }} />
              ) : (
                <User size={14} style={{ color: "#00FF88" }} />
              )}
            </div>
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3"
              style={
                msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,212,255,0.08))",
                      border: "1px solid rgba(0,212,255,0.2)",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              <div
                className="text-sm leading-relaxed prose prose-invert max-w-none"
                style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Cairo', sans-serif" }}
              >
                <Streamdown>{msg.content}</Streamdown>
              </div>
              <p
                className="text-xs mt-1.5"
                style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {msg.timestamp.toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming / Loading */}
        {(isLoading || streamingContent) && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)" }}
            >
              <Brain size={14} style={{ color: "#00D4FF" }} />
            </div>
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {streamingContent ? (
                <div
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Cairo', sans-serif" }}
                >
                  <Streamdown>{streamingContent}</Streamdown>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: "#00D4FF", animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(0,212,255,0.1)", background: "#0D1526" }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl p-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.2)" }}
        >
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              lang === "ar"
                ? "اسأل Ada2ai عن التدريبات، تحليل الأداء، أو خطط مخصصة..."
                : "Ask Ada2ai about training, performance analysis, or custom plans..."
            }
            rows={1}
            disabled={isLoading || !!streamingContent}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed disabled:opacity-50"
            style={{
              color: "rgba(255,255,255,0.9)",
              fontFamily: "'Cairo', sans-serif",
              maxHeight: "120px",
              minHeight: "24px",
              direction: isRTL ? "rtl" : "ltr",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading || !!streamingContent}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                inputValue.trim() && !isLoading && !streamingContent
                  ? "linear-gradient(135deg, #00D4FF, #00FF88)"
                  : "rgba(255,255,255,0.1)",
            }}
          >
            <Send size={16} style={{ color: inputValue.trim() ? "#0A0E1A" : "rgba(255,255,255,0.5)" }} />
          </button>
        </div>
        <p
          className="text-center text-xs mt-2"
          style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'Cairo', sans-serif" }}
        >
          {lang === "ar" ? "مدعوم بـ Ada2ai • نموذج متقدم" : "Powered by Ada2ai • Advanced Model"}
        </p>
      </div>
    </div>
  );
}
