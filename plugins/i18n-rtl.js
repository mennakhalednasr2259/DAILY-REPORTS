export default function ({ app, $vuetify }) {
  const syncDirection = (locale) => {
    if (typeof document === 'undefined') return
    const isArabic = locale === 'ar'
    document.documentElement.lang = locale
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr'
    if ($vuetify) $vuetify.rtl = isArabic
  }

  syncDirection(app.i18n.locale)
  app.i18n.onLanguageSwitched = (oldLocale, newLocale) => syncDirection(newLocale)
}
