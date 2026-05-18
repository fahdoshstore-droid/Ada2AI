import { Link } from 'react-router-dom'

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
    body: 'privacy@ada2ai.com',
  },
]

export default function PrivacyPolicy() {
  return (
    <div dir="rtl" className="min-h-screen bg-navy flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl glass-card rounded-2xl p-8">
        <Link to="/" className="text-ice-muted text-sm arabic-text hover:text-teal-prime transition-colors mb-6 inline-block">
          → العودة
        </Link>

        <h1 className="text-2xl font-bold text-ice-white arabic-text mb-8">
          سياسة الخصوصية
        </h1>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-semibold text-teal-prime arabic-text mb-2">
                {s.title}
              </h2>
              <p className="text-sm text-ice-muted arabic-text leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}