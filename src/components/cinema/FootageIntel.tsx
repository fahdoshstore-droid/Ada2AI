/**
 * FootageIntel — "Footage to Intelligence" section
 *
 * Hosts the telestrator-style sequence (TelestratorSequence): match scene → freeze
 * → tracking IDs → tactical drawing → observations → tactical board.
 *
 * HONESTY: the sequence is an ILLUSTRATION over an AI-generated still. It is not
 * output of an automatic tracker and carries no real data (see TelestratorSequence).
 */
import { GhostNumber, SplitReveal } from './Cinema'
import TelestratorSequence from './TelestratorSequence'

export default function FootageIntel() {
  return (
    <section className="relative overflow-hidden bg-[#000A0F] py-24 md:py-40" aria-label="من فيديو المباراة إلى نتائج التحليل">
      <GhostNumber n="02" className="-top-8 end-[-3%]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-3xl md:mb-20">
          <span className="text-label-caps mb-4 inline-block">من اللقطة إلى المعلومة</span>
          <SplitReveal
            as="h2"
            text="من فيديو المباراة إلى نتائج التحليل"
            className="text-4xl font-black leading-[1.25] tracking-tightest text-ice-white arabic-text md:text-6xl"
          />
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ice-muted arabic-text">
            ارفع فيديو اللاعب أو المنافس، ثم تابع حالة التحليل وسجّل النتائج: اللمسات، السرعة، الاستحواذ ومناطق التحرك.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ice-muted/80 arabic-text">
            العرض أدناه توضيح لأسلوب القراءة التلفزيونية للّقطة: مشهد، تجميد، تتبّع، رسم، ثم لوحة.
          </p>
        </div>

        <TelestratorSequence />
      </div>
    </section>
  )
}
