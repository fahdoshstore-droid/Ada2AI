/**
 * FootageIntel — "Footage to Intelligence" section
 *
 * Primary: RealMatchAnalysis — a real YOLO11n + ByteTrack run over real match
 * footage, with playback, synced detection overlays and evidence timestamps.
 *
 * Secondary: TelestratorSequence — the telestrator-style illustration of the
 * TV reading grammar (scene → freeze → track → draw → board). It remains a
 * hand-drawn ILLUSTRATION over an AI-generated still (see that file).
 */
import { GhostNumber, SplitReveal } from './Cinema'
import TelestratorSequence from './TelestratorSequence'
import RealMatchAnalysis from './RealMatchAnalysis'

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
            تحليل حقيقي بلقطة مباراة فعلية عبر الرؤية الحاسوبية: كشف اللاعبين وتتبّعهم، الكرة، والانتقال إلى توقيتات الأدلة.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ice-muted/80 arabic-text">
            النتائج من تشغيل YOLO11n + ByteTrack فعلي، دون معايرة ملعب — المواقع بإحداثيات الصورة فقط، وتعيين الفريق غير مؤكد.
          </p>
        </div>

        {/* Real match analysis (primary) */}
        <RealMatchAnalysis />

        {/* Reading-grammar illustration (secondary, clearly labelled) */}
        <div className="mb-8 mt-20 border-t border-white/10 pt-14">
          <span className="text-label-caps mb-3 inline-block">توضيح أسلوب القراءة</span>
          <h3 className="text-2xl font-bold text-ice-white arabic-text md:text-3xl">كيف تُقرأ اللقطة</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ice-muted/80 arabic-text">
            التسلسل أدناه توضيحي فوق لقطة مولّدة، لشرح أسلوب القراءة التلفزيونية: مشهد، تجميد، تتبّع، رسم، ثم لوحة.
          </p>
        </div>
        <TelestratorSequence />
      </div>
    </section>
  )
}
