<template>
  <button class="icon-button" type="button" :aria-label="$t('Toggle language')" :title="$t('Toggle language')" @click="toggleLanguage">
    <v-icon small>mdi-translate</v-icon><span>{{ $i18n.locale === 'ar' ? 'EN' : 'عربي' }}</span>
  </button>
</template>
<script>
export default {
  name: 'ReportLocaleToggle',
  mounted() {
    try {
      const savedLocale = localStorage.getItem('daily-reports-locale')
      if (savedLocale && savedLocale !== this.$i18n.locale) this.setLocale(savedLocale)
    } catch (_) {}
  },
  methods: {
    setLocale(locale) {
      this.$i18n.setLocale(locale)
      this.$vuetify.rtl = locale === 'ar'
    },
    toggleLanguage() {
      const locale = this.$i18n.locale === 'ar' ? 'en' : 'ar'
      this.setLocale(locale)
      try { localStorage.setItem('daily-reports-locale', locale) } catch (_) {}
    },
  },
}
</script>
