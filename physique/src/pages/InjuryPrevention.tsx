import { Link } from "react-router-dom";

const sections = [
  {
    title: "الإحماء قبل التمرين",
    intro: "الإحماء يساعد على تهيئة الجسم تدريجيًا للجهد البدني.",
    items: [
      "ابدأ بـ 5–10 دقائق من النشاط الخفيف، مثل المشي أو الدراجة.",
      "أضف حركات ديناميكية تناسب التمرين والعضلات المستهدفة.",
      "ابدأ تمارين المقاومة بأوزان خفيفة، ثم زد الحمل تدريجيًا.",
      "تجنّب البدء مباشرة بأوزان ثقيلة دون تهيئة مناسبة.",
    ],
  },
  {
    title: "الإطالة",
    intro: "الإطالة تساعد على تحسين المرونة ومدى الحركة عند أدائها بطريقة مناسبة.",
    items: [
      "نفّذ الحركات بهدوء ودون ارتداد.",
      "يمكن تثبيت الإطالة عادةً لمدة 10–30 ثانية حسب نوعها واحتياجك.",
      "تجنّب إجبار العضلة أو المفصل على حركة مؤلمة.",
      "قبل التمرين، فضّل الحركات الديناميكية المناسبة للنشاط، واستخدم الإطالة الثابتة ضمن برنامج المرونة المناسب.",
    ],
  },
  {
    title: "التهدئة بعد التمرين",
    intro: null,
    items: [
      "خفّف شدة النشاط تدريجيًا لمدة مناسبة لشدة التمرين.",
      "نفّذ إطالات خفيفة إذا كانت مريحة ومناسبة لك.",
      "تذكّر أن الإطالة ليست ضمانًا لمنع الإصابات أو إزالة ألم العضلات.",
    ],
  },
];

export function InjuryPrevention() {
  return (
    <div dir="rtl" className="min-h-screen bg-ada-navy text-ada-text">
      <header className="border-b border-ada-teal/10 bg-ada-navy/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="font-display text-xl font-black tracking-tight text-ada-teal">
            Ada2<span className="text-ada-text">Physique</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-ada-muted hover:text-ada-text">العودة للرئيسية</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <section className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ada-teal">Injury Prevention &amp; Recovery</p>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">الوقاية من الإصابات والتعافي</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading--relaxed text-ada-muted">تدرّب بوعي. جهّز جسمك قبل التمرين.</p>
        </section>

        <section className="mt-12 rounded-[var(--radius-card)] border border-ada-teal/15 bg-ada-card p-3 shadow-elev-2 sm:p-5" aria-labelledby="infographic-title">
          <h2 id="infographic-title" className="sr-only">إنفوغراف توعوي عن ألم الرقبة والظهر العلوي وتمارين الإطالة والوقاية من الإصابات</h2>
          <a href="/images/injury-prevention-recovery.png" target="_blank" rel="noreferrer" title="فتح الإنفوغراف بحجمه الكامل">
            <img src="/images/injury-prevention-recovery.png" alt="إنفوغراف عربي يوضح أماكن ألم الرقبة والظهر العلوي، تمارين الإحماء والإطالة والحركة، وإرشادات الوقاية من الإصابات" className="h-auto w-full rounded-xl" />
          </a>
          <p className="mt-3 text-center text-xs text-ada-muted">اضغط على الصورة لفتحها بحجم أكبر</p>
        </section>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[var(--radius-card)] border border-ada-teal/10 bg-ada-card p-6">
              <h2 className="text-xl font-bold text-ada-teal">{section.title}</h2>
              {section.intro && <p className="mt-4 leading-8 text-ada-text">{section.intro}</p>}
              <ul className="mt-4 list-disc space-y-3 pe-5 leading-8 text-ada-muted">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          ))}
        </div>

        <aside className="mt-6 rounded-[var(--radius-card)] border border-ada-warning/40 bg-ada-warning/10 p-6 leading-8" aria-label="تنبيه صحي">
          <h2 className="text-xl font-bold text-ada-warning">تنبيه صحي</h2>
          <p className="mt-3">إذا شعرت بألم مفاجئ أو شديد، أو ظهرت محدودية واضحة في الحركة، أو تنميل أو ضعف، أوقف التمرين واطلب تقييمًا طبيًا مناسبًا.</p>
          <p className="mt-3 text-sm text-ada-muted">المحتوى للتوعية العامة ولا يُعد تشخيصًا طبيًا أو بديلًا عن تقييم المختص.</p>
        </aside>
      </main>

      <footer className="border-t border-ada-teal/10 px-5 py-8 text-center text-xs text-ada-muted sm:px-8">Ada2Physique — coach-led physique coaching with AI-assisted insights.</footer>
    </div>
  );
}
