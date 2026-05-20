# إعداد حساب Admin — نادي الروضة

## الخطوات

1. اذهب إلى ada2ai.com/#/login
2. اضغط "إنشاء حساب جديد"
3. البريد الإلكتروني: admin@alrawdha.sa
4. كلمة المرور: اختر كلمة مرور قوية (12+ حرف)
5. بعد التسجيل، اذهب إلى Supabase Dashboard → Table Editor → profiles
6. ابحث عن الـ record بهذا البريد
7. غيّر user_type إلى: coach
8. أضف في حقل sport: admin
9. أضف في حقل region: الروضة

## تعريف الـ Admin في التطبيق
الـ admin يُعرَّف بـ:
`profiles.user_type = 'coach' AND profiles.sport = 'admin'`

هذا يعني أن أي حساب coach عادي بدون `sport = 'admin'` لن يستطيع الوصول لـ `/admin`.