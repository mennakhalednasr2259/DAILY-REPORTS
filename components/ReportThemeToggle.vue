<template>
  <button
    class="icon-button theme-toggle"
    type="button"
    :aria-label="darkMode ? $t('Light mode') : $t('Dark mode')"
    :title="darkMode ? $t('Light mode') : $t('Dark mode')"
    @click="toggleTheme"
  >
    <v-icon small>{{ darkMode ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
  </button>
</template>

<script>
const THEME_STORAGE_KEY = 'daily-reports-theme'

export default {
  name: 'ReportThemeToggle',
  data() { return { darkMode: false } },
  mounted() {
    try { this.setTheme(localStorage.getItem(THEME_STORAGE_KEY) === 'dark') } catch (_) { this.setTheme(false) }
  },
  methods: {
    setTheme(isDark) {
      this.darkMode = isDark
      this.$vuetify.theme.dark = isDark
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    },
    toggleTheme() {
      const isDark = !this.darkMode
      this.setTheme(isDark)
      try { localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light') } catch (_) {}
    },
  },
}
</script>
