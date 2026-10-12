<template>
  <div class="report-row-scroll">
    <article class="report-card">
      <div class="report-card__identity">
        <img class="report-card__icon" src="~/assets/imgs/copy.svg" alt="">
        <h3>{{ author }}</h3>
        <span class="report-card__date">{{ formatDate(report.reportDate || report.createdAt) }}</span>
      </div>
      <div class="report-card__actions">
        <span class="report-card__created">{{ formatDateTime(report.createdAt) }}</span>
        <button class="button button-view" type="button" @click="$emit('view', report)">{{ $t('View report') }}</button>
      </div>
    </article>
  </div>
</template>
<script>
export default {
  name: 'ReportListItem',
  props: {
    report: { type: Object, required: true },
    locale: { type: String, required: true },
  },
  computed: {
    author() {
      return this.report['author' + (this.locale === 'ar' ? 'Ar' : 'En')] || this.report.author || ''
    },
  },
  methods: {
    formatDate(value) {
      const date = new Date(String(value).length === 10 ? value + 'T00:00:00' : value)
      return new Intl.DateTimeFormat(this.locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
    },
    formatDateTime(value) {
      return new Intl.DateTimeFormat(this.locale, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    },
  },
}
</script>
