import { MessageCircle, Mail, Phone, Building2, TrendingUp, Handshake } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const contactOptions = [
  {
    icon: <Building2 size={24} />,
    title: "شراكات مع أندية وأكاديميات",
    desc: "انضم كشريك وابدأ باكتشاف المواهب في منطقتك",
    cta: "تواصل معنا",
    color: "oklch(0.65 0.2 145)",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "استثمار لتوسيع المنصة",
    desc: "فرصة استثمارية في سوق غير مستغل بإمكانات ضخمة",
    cta: "اعرف أكثر",
    color: "oklch(0.85 0.18 85)",
  },
  {
    icon: <Handshake size={24} />,
    title: "احتضان وتسريع",
    desc: "نبحث عن برامج احتضان وتسريع لدعم النمو",
    cta: "تواصل معنا",
    color: "oklch(0.65 0.2 200)",
  },
];

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً", {
        style: {
          background: "oklch(0.12 0.02 240)",
          border: "1px solid oklch(0.65 0.2 145 / 0.4)",
          color: "white",
        },
      });
      // Auto-open WhatsApp with pre-filled message
      const msg = encodeURIComponent(
        `مرحباً Ada2ai 👋\n\nالاسم: ${form.name}\nالبريد: ${form.email}\nالهاتف: ${form.phone || 'غير محدد'}\nنوع التعاون: ${form.type || 'غير محدد'}\n\n${form.message}`
      );
      setTimeout(() => window.open(`https://wa.me/966500000000?text=${msg}`, "_blank"), 600);
      setForm({ name: "", email: "", phone: "", type: "", message: "" });
    }, 1500);
  };

  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="tag-green mb-4 inline-block">تواصل معنا</span>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            نبحث عن
            <span className="neon-text"> شركاء النجاح</span>
          </h2>
          <p
            className="text-white/50 text-lg max-w-xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            سواء كنت ناديًا، أكاديمية، مستثمرًا، أو مسرّعًا — نريد أن نسمع منك
          </p>
        </div>

        {/* Contact options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 max-w-4xl mx-auto">
          {contactOptions.map((opt, i) => (
            <div
              key={i}
              className="card-dark rounded-xl p-6 text-center group hover:neon-border transition-all duration-300"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors"
                style={{
                  background: `${opt.color} / 0.1`.replace("/ 0.1", ""),
                  backgroundColor: `${opt.color.replace("oklch(", "oklch(").replace(")", " / 0.1)")}`,
                  color: opt.color,
                }}
              >
                {opt.icon}
              </div>
              <h3
                className="text-white font-bold text-lg mb-2"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {opt.title}
              </h3>
              <p
                className="text-white/50 text-sm mb-4 leading-relaxed"
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {opt.desc}
              </p>
              <button
                className="btn-outline-green text-sm px-4 py-2 w-full"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
                onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })}
              >
                {opt.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="card-dark neon-border rounded-2xl p-8">
            <h3
              className="text-white font-bold text-2xl mb-6 text-center"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              أرسل رسالتك
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="text-white/60 text-sm mb-2 block"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  الاسم
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[oklch(0.16_0.02_240)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[oklch(0.65_0.2_145/0.6)] transition-colors"
                  placeholder="اسمك الكامل"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                />
              </div>
              <div>
                <label
                  className="text-white/60 text-sm mb-2 block"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[oklch(0.16_0.02_240)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[oklch(0.65_0.2_145/0.6)] transition-colors"
                  placeholder="email@example.com"
                  dir="ltr"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="text-white/60 text-sm mb-2 block"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-[oklch(0.16_0.02_240)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[oklch(0.65_0.2_145/0.6)] transition-colors"
                  placeholder="+966 5X XXX XXXX"
                  dir="ltr"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                />
              </div>
              <div>
                <label
                  className="text-white/60 text-sm mb-2 block"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  نوع التعاون
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-[oklch(0.16_0.02_240)] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[oklch(0.65_0.2_145/0.6)] transition-colors"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  <option value="" style={{ background: "oklch(0.12 0.02 240)" }}>اختر نوع التعاون</option>
                  <option value="club" style={{ background: "oklch(0.12 0.02 240)" }}>نادي رياضي</option>
                  <option value="academy" style={{ background: "oklch(0.12 0.02 240)" }}>أكاديمية رياضية</option>
                  <option value="investor" style={{ background: "oklch(0.12 0.02 240)" }}>مستثمر</option>
                  <option value="accelerator" style={{ background: "oklch(0.12 0.02 240)" }}>مسرّع أعمال</option>
                  <option value="other" style={{ background: "oklch(0.12 0.02 240)" }}>أخرى</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label
                className="text-white/60 text-sm mb-2 block"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                رسالتك
              </label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                className="w-full bg-[oklch(0.16_0.02_240)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[oklch(0.65_0.2_145/0.6)] transition-colors resize-none"
                placeholder="أخبرنا عن اهتمامك بالمنصة..."
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  إرسال الرسالة
                </>
              )}
            </button>
          </form>

          {/* Direct contact */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-[oklch(0.65_0.2_145)] transition-colors text-sm"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              <MessageCircle size={16} />
              تواصل عبر واتساب
            </a>
            <span className="text-white/20 hidden sm:block">|</span>
            <a
              href="mailto:hello@scoutai.sa"
              className="flex items-center gap-2 text-white/60 hover:text-[oklch(0.65_0.2_145)] transition-colors text-sm"
              style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
            >
              <Mail size={16} />
              hello@scoutai.sa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
