const demoCopy = [
  { titleAr: 'مراجعة تقدم تطوير لوحة التحكم', titleEn: 'Dashboard development progress review', authorAr: 'أحمد توفيق', authorEn: 'Ahmed Tawfik', teamKey: 'frontend', summaryAr: 'إنهاء بطاقات المؤشرات ومراجعة العرض على الشاشات الصغيرة.', summaryEn: 'Finished the KPI cards and reviewed the layout on smaller screens.', achievementsAr: 'تم ربط البطاقات بالبيانات التجريبية وتحسين حالات التحميل.', achievementsEn: 'Connected the cards to sample data and improved loading states.', blockersAr: '', blockersEn: '', nextStepsAr: 'مراجعة التباين وإضافة حالات الخطأ.', nextStepsEn: 'Review contrast and add error states.' },
  { titleAr: 'اختبارات تدفق تسجيل الدخول', titleEn: 'Sign-in flow testing', authorAr: 'سارة محمود', authorEn: 'Sarah Mahmoud', teamKey: 'testing', summaryAr: 'اختبار تسجيل الدخول والخروج والتحقق من رسائل التنبيه.', summaryEn: 'Tested sign-in, sign-out, and validation messages.', achievementsAr: 'اجتازت السيناريوهات الأساسية على الهاتف والكمبيوتر.', achievementsEn: 'Core scenarios passed on mobile and desktop.', blockersAr: 'نحتاج مراجعة نص رسالة انتهاء الجلسة.', blockersEn: 'The session-expired message needs a copy review.', nextStepsAr: 'إعادة اختبار الجلسة بعد تحديث النص.', nextStepsEn: 'Retest session expiry after the copy update.' },
  { titleAr: 'تحديث واجهة متابعة المهام', titleEn: 'Task tracking interface update', authorAr: 'منة الله خالد', authorEn: 'Menna Khaled', teamKey: 'design', summaryAr: 'تسليم تصور جديد لعرض المهام ومؤشرات الإنجاز.', summaryEn: 'Delivered a refreshed task view and progress indicators.', achievementsAr: 'تم اعتماد اتجاه البطاقات وحالات المهام.', achievementsEn: 'Card layout and task states were approved.', blockersAr: '', blockersEn: '', nextStepsAr: 'تجهيز ملفات التصميم للمطورين.', nextStepsEn: 'Prepare design handoff files for developers.' },
  { titleAr: 'تحسين استجابة خدمات العملاء', titleEn: 'Customer service API improvements', authorAr: 'عمر خالد', authorEn: 'Omar Khaled', teamKey: 'backend', summaryAr: 'تقليل زمن الاستجابة وإضافة معالجة للحالات غير المتوقعة.', summaryEn: 'Reduced response time and handled unexpected cases.', achievementsAr: 'انخفض متوسط زمن الاستجابة في الاختبارات المحلية.', achievementsEn: 'Average response time dropped in local checks.', blockersAr: '', blockersEn: '', nextStepsAr: 'مراجعة سجلات الأخطاء وإغلاق المهام المتبقية.', nextStepsEn: 'Review error logs and close the remaining tasks.' },
  { titleAr: 'مراجعة تجربة إنشاء تقرير يومي', titleEn: 'Daily report creation UX review', authorAr: 'أحمد توفيق', authorEn: 'Ahmed Tawfik', teamKey: 'frontend', summaryAr: 'تجربة نموذج التقرير وتبسيط خطوات الحفظ كمسودة.', summaryEn: 'Reviewed the report form and simplified draft saving.', achievementsAr: 'أصبحت الحقول الأساسية واضحة على الهاتف.', achievementsEn: 'Required fields are clearer on mobile.', blockersAr: '', blockersEn: '', nextStepsAr: 'إضافة معاينة قبل الإرسال.', nextStepsEn: 'Add a preview before submission.' },
  { titleAr: 'فحص توافق المتصفحات', titleEn: 'Cross-browser compatibility checks', authorAr: 'سارة محمود', authorEn: 'Sarah Mahmoud', teamKey: 'testing', summaryAr: 'مقارنة عرض النماذج والجداول في المتصفحات الرئيسية.', summaryEn: 'Compared forms and tables across major browsers.', achievementsAr: 'تم إصلاح مشكلتين في عرض التاريخ.', achievementsEn: 'Fixed two date display issues.', blockersAr: '', blockersEn: '', nextStepsAr: 'التحقق من نتائج الإصلاح على الأجهزة اللوحية.', nextStepsEn: 'Verify the fixes on tablet devices.' },
  { titleAr: 'تسليم مكونات صفحة التقارير', titleEn: 'Reports page component handoff', authorAr: 'منة الله خالد', authorEn: 'Menna Khaled', teamKey: 'design', summaryAr: 'تنظيم المكونات والألوان والحالات الفارغة.', summaryEn: 'Organized components, colors, and empty states.', achievementsAr: 'اكتملت مراجعة حالات القائمة والفلاتر.', achievementsEn: 'List and filter states passed design review.', blockersAr: '', blockersEn: '', nextStepsAr: 'مراجعة صفحة التفاصيل مع الفريق.', nextStepsEn: 'Review the details page with the team.' },
  { titleAr: 'تحديث قواعد عرض التقارير', titleEn: 'Report visibility rules update', authorAr: 'عمر خالد', authorEn: 'Omar Khaled', teamKey: 'backend', summaryAr: 'مراجعة قواعد إظهار التقارير حسب الفريق.', summaryEn: 'Reviewed report visibility rules by team.', achievementsAr: 'تم توثيق الحالات الحالية.', achievementsEn: 'Current cases are documented.', blockersAr: 'في انتظار اعتماد آلية التقارير الأسبوعية.', blockersEn: 'Weekly reporting rules are awaiting approval.', nextStepsAr: 'مناقشة الحالات الاستثنائية مع مدير المشروع.', nextStepsEn: 'Discuss edge cases with the project manager.' },
]

export function getSeedReports() {
  return demoCopy.map((report, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)
    const reportDate = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
    return { id: 'RPT-' + String(index + 1).padStart(3, '0'), ...report, status: index === 3 || index === 7 ? 'draft' : 'submitted', reportDate, createdAt: date.toISOString(), updatedAt: date.toISOString() }
  })
}

export function filterReports(reports, filters, locale) {
  const query = String(filters.search || '').trim().toLocaleLowerCase(locale)
  return reports.filter(report => {
    const searchableText = ['titleAr', 'titleEn', 'authorAr', 'authorEn', 'summaryAr', 'summaryEn']
      .map(field => report[field] || '').join(' ').toLocaleLowerCase(locale)
    return (!query || searchableText.includes(query)) &&
      (!filters.team || report.teamKey === filters.team) &&
      (!filters.status || report.status === filters.status) &&
      (!filters.fromDate || report.reportDate >= filters.fromDate) &&
      (!filters.toDate || report.reportDate <= filters.toDate)
  }).sort((left, right) => right.reportDate.localeCompare(left.reportDate) || right.updatedAt.localeCompare(left.updatedAt))
}
