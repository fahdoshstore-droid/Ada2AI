import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Bot, BarChart3, Target, Zap, Film, Clock } from 'lucide-react';

const analysisTypes = [
  { icon: Target, title: 'تحليل الحركة', desc: 'تتبع حركة اللاعبين وتحليل المسارات' },
  { icon: BarChart3, title: 'إحصائيات المباراة', desc: 'استحواذ، تسديد، تمرير، وأكثر' },
  { icon: Zap, title: 'السرعة والتسارع', desc: 'قياس السرعة اللحظية والتسارع' },
  { icon: Bot, title: 'YOLO Detection', desc: 'اكتشاف تلقائي للاعبين والكرة' },
];

const recentAnalyses = [
  { match: 'الهلال vs النصر', date: '2026-04-15', duration: '90:00', status: 'مكتمل' },
  { match: 'الأهلي vs الاتحاد', date: '2026-04-10', duration: '90:00', status: 'مكتمل' },
  { match: 'الشباب vs الفتح', date: '2026-04-05', duration: '90:00', status: 'قيد المعالجة' },
];

export default function VideoAnalysis() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal-prime/10 rounded-full blur-[128px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-prime/10 border border-teal-prime/20 text-teal-prime text-sm font-medium mb-6">
              <Film className="w-4 h-4" />
              <span className="arabic-text">تحليل الفيديو</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-teal arabic-text">تحليل الفيديو</span>
              <br />
              <span className="text-ice-white arabic-text">بالذكاء الاصطناعي</span>
            </h1>
            <p className="text-ice-muted text-lg leading-relaxed max-w-2xl arabic-text">
              حلل مباريات الفيديو باستخدام تقنيات YOLO المتقدمة والنماذج الذكية 
              للحصول على إحصائيات دقيقة ورؤى تحليلية عميقة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upload & Player */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass-card rounded-2xl p-8 text-center h-full flex flex-col justify-center border-dashed border-2 border-teal-prime/20 hover:border-teal-prime/40 transition-colors">
                <div className="w-20 h-20 rounded-2xl bg-teal-prime/10 flex items-center justify-center mx-auto mb-6">
                  <Film className="w-10 h-10 text-teal-prime" />
                </div>
                <h3 className="text-xl font-bold text-ice-white mb-3 arabic-text">رفع فيديو المباراة</h3>
                <p className="text-ice-muted mb-6 arabic-text">
                  اسحب الفيديو هنا أو انقر للاختيار من جهازك
                  <br />
                  يدعم MP4, MOV, AVI (بحد أقصى 2GB)
                </p>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold hover:shadow-xl hover:shadow-teal-prime/25 transition-all arabic-text mx-auto">
                  اختيار ملف الفيديو
                </button>
              </div>
            </motion.div>

            {/* Video Player Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="relative aspect-video bg-navy-dark flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-navy-light/50 to-navy-dark" />
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="relative w-20 h-20 rounded-full bg-teal-prime/20 backdrop-blur flex items-center justify-center hover:bg-teal-prime/30 transition-all group"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-teal-prime" />
                    ) : (
                      <Play className="w-8 h-8 text-teal-prime ml-1" />
                    )}
                  </button>
                  {/* Fake progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div className="h-full w-1/3 bg-gradient-to-r from-teal-prime to-scout-blue" />
                  </div>
                  <div className="absolute bottom-3 left-4 text-xs text-ice-muted flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>30:15 / 90:00</span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-ice-white mb-1 arabic-text">معاينة التحليل</h4>
                  <p className="text-sm text-ice-muted arabic-text">الهلال vs النصر - الجولة 24</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Analysis Types */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gradient-teal mb-8 text-center arabic-text">أنواع التحليل المتاحة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analysisTypes.map((type, i) => {
                const Icon = type.icon;
                return (
                  <motion.div
                    key={type.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="glass-card glass-card-hover rounded-2xl p-6 text-center h-full">
                      <div className="w-14 h-14 rounded-xl bg-teal-prime/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-teal-prime" />
                      </div>
                      <h3 className="font-bold text-ice-white mb-2 arabic-text">{type.title}</h3>
                      <p className="text-sm text-ice-muted arabic-text">{type.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-ice-white mb-6 arabic-text">التحليلات الأخيرة</h2>
            <div className="space-y-3">
              {recentAnalyses.map((analysis, i) => (
                <motion.div
                  key={analysis.match}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-teal-prime/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-teal-prime/10 flex items-center justify-center">
                        <Film className="w-5 h-5 text-teal-prime" />
                      </div>
                      <div>
                        <div className="font-medium text-ice-white arabic-text">{analysis.match}</div>
                        <div className="text-xs text-ice-muted">{analysis.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-ice-muted">{analysis.duration}</span>
                      <span className={`text-xs px-3 py-1 rounded-lg font-medium ${
                        analysis.status === 'مكتمل' 
                          ? 'bg-green-400/10 text-green-400' 
                          : 'bg-gold/10 text-gold'
                      } arabic-text`}>
                        {analysis.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
