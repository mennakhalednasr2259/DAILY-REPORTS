export default function ({ $vuetify }) {
  let isDark = false
  try { isDark = localStorage.getItem('daily-reports-theme') === 'dark' } catch (_) {}
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  if ($vuetify && $vuetify.theme) $vuetify.theme.dark = isDark
}
