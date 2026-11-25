import { ShieldCheck } from 'lucide-react'
import PageHeader from '../components/cinema/PageHeader'

const sections = [
  {
    title: 'ما نجمعه',
    body: 'الاسم، الرياضة، المركز، مقاطع الفيديو',
  },
  {
    title: 'كيف نستخدمه',
    body: 'عرضه للكشافين والمدربين المسجلين فقط',
  },
  {
    title: 'من يرى بياناتك',
    body: 'الكشافون والمدربون المسجلون في المنصة',
  },
  {
    title: 'حقوقك',
    body: 'يمكنك طلب حذف بياناتك عبر مراسلتنا على privacy@ada2ai.com',
  },
  {
    title: 'بيانات القاصرين',
    body: 'نطلب موافقة ولي الأمر للمستخدمين دون 18 سنة',
  },
  {
    title: 'تواصل',
    body: 'info@ada2ai.com',
  },
]

export default function PrivacyPolicy() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#000A0F]">
      <PageHeader
        eyebrow="الخصوصية"
        icon={ShieldCheck}
        titleTop="سياسة"
        titleBottom="الخصوصية"
        description="ما نجمعه من بيانات، ومن يراها، وكيف تطلب حذفها."
        compact
      />
      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        <ol className="border-t border-white/10">
          {sections.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/10 py-6">
              <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="mb-1 text-lg font-bold text-ice-white arabic-text">{s.title}</h2>
                <p className="leading-relaxed text-ice-muted arabic-text">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
