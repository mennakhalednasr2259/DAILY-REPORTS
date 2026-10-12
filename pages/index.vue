<template>
  <main class="reports-page">
    <header class="page-header">
      <h1>{{ $t('All daily reports') }}</h1>
      <div class="header-actions">
        <button class="button button-primary" type="button" @click="openCreate">
          <v-icon small>mdi-plus</v-icon>{{ $t('Create report') }}
        </button>
        <v-menu offset-y left content-class="reports-actions-menu">
          <template v-slot:activator="{ on, attrs }">
            <button class="button button-outline header-actions-menu" type="button" v-bind="attrs" v-on="on">
              <v-icon small>mdi-dots-horizontal</v-icon>{{ $t('More actions') }}
            </button>
          </template>
          <v-list dense>
            <v-list-item @click="exportExcel">
              <v-list-item-icon><v-icon small>mdi-microsoft-excel</v-icon></v-list-item-icon>
              <v-list-item-title>{{ $t('Export Excel') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportWeeklyPdf">
              <v-list-item-icon><v-icon small>mdi-file-pdf-box</v-icon></v-list-item-icon>
              <v-list-item-title>{{ $t('Weekly PDF') }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="sendReportReminders">
              <v-list-item-icon><v-icon small>mdi-bell-outline</v-icon></v-list-item-icon>
              <v-list-item-title>{{ $t('Send report reminders') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <report-locale-toggle />
          <report-theme-toggle />
      </div>
    </header>

    <report-filters
      v-model="filters"
      :teams="teams"
      @apply="applyFilters"
    />

    <section class="reports-section" aria-live="polite">
      <div v-if="pagedReports.length" class="report-list">
        <report-list-item
          v-for="report in pagedReports"
          :key="report.id"
          :report="report"
          :locale="$i18n.locale"
          @view="goToReport"
        />
      </div>
      <div v-else class="empty-state">
        <span class="empty-icon"><v-icon>mdi-text-box-search-outline</v-icon></span>
        <h3>{{ $t('No reports found') }}</h3>
        <p>{{ $t('No reports hint') }}</p>
      </div>

      <report-pagination
        v-if="lastPage > 1"
        :current-page="currentPage"
        :last-page="lastPage"
        @change="goToPage"
      />
    </section>


    <v-snackbar v-model="snackbar" :timeout="2800" color="secondary" :right="$i18n.locale === 'en'">{{ snackbarText }}</v-snackbar>
  </main>
</template>

<script>
import ReportFilters from '~/components/ReportFilters.vue'
import ReportListItem from '~/components/ReportListItem.vue'
import ReportPagination from '~/components/ReportPagination.vue'
import ReportLocaleToggle from '~/components/ReportLocaleToggle.vue'
import ReportThemeToggle from '~/components/ReportThemeToggle.vue'
import { loadReports } from '~/utils/reportStorage'
import { filterReports, getSeedReports } from '~/utils/reportData'
import { downloadExcel, downloadWeeklyPdf } from '~/utils/reportExport'

export default {
  name: 'DailyReportsPage',
  components: { ReportFilters, ReportListItem, ReportPagination, ReportLocaleToggle, ReportThemeToggle },
  data() {
    return {
      reports: [],
      filters: { team: '', fromDate: '', toDate: '' },
      appliedFilters: { team: '', fromDate: '', toDate: '' },
      currentPage: 1,
      pageSize: 6,
      snackbar: false,
      snackbarText: '',
    }
  },
  computed: {
    teams() {
      return ['frontend', 'backend', 'testing', 'design'].map(key => ({
        key,
        label: this.$t('Team ' + key),
      }))
    },
    filteredReports() {
      return filterReports(this.reports, this.appliedFilters, this.$i18n.locale)
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.filteredReports.length / this.pageSize))
    },
    pagedReports() {
      return this.filteredReports.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
    },
  },
  watch: {
    '$i18n.locale'() {
      this.$nextTick(() => { document.title = this.$t('Daily reports') })
    },
  },
  mounted() {
    this.reports = loadReports(getSeedReports())
    this.restoreFiltersFromRoute()
    document.title = this.$t('Daily reports')
    try {
      const flashMessage = localStorage.getItem('daily-reports-flash')
      if (flashMessage) { localStorage.removeItem('daily-reports-flash'); this.notify(flashMessage) }
    } catch (_) {}
  },
  methods: {
    applyFilters() {
      if (this.filters.fromDate && this.filters.toDate && this.filters.fromDate > this.filters.toDate) {
        this.notify(this.$t('Invalid date range'))
        return
      }
      this.appliedFilters = { ...this.filters }
      this.currentPage = 1
      this.syncFiltersToRoute()
    },
    restoreFiltersFromRoute() {
      const query = this.$route.query || {}
      const fromDate = Array.isArray(query.from_date) ? query.from_date[0] : query.from_date
      const toDate = Array.isArray(query.to_date) ? query.to_date[0] : query.to_date
      const team = Array.isArray(query.team) ? query.team[0] : query.team
      this.filters = {
        team: team && team !== 'all' ? String(team) : '',
        fromDate: fromDate ? String(fromDate) : '',
        toDate: toDate ? String(toDate) : '',
      }
      this.appliedFilters = { ...this.filters }
    },
    syncFiltersToRoute() {
      const query = { ...this.$route.query }
      const values = { team: this.filters.team, from_date: this.filters.fromDate, to_date: this.filters.toDate }
      Object.keys(values).forEach((key) => {
        if (values[key]) query[key] = values[key]
        else delete query[key]
      })
      const currentKeys = Object.keys(this.$route.query)
      const nextKeys = Object.keys(query)
      const unchanged = currentKeys.length === nextKeys.length && nextKeys.every(key => String(query[key]) === String(this.$route.query[key]))
      if (!unchanged) this.$router.replace({ query }).catch(() => {})
    },
    goToPage(page) {
      this.currentPage = Math.max(1, Math.min(Number(page), this.lastPage))
    },
    openCreate() { this.$router.push('/reports/create') },
    goToReport(report) { this.$router.push('/reports/' + encodeURIComponent(report.id)) },
    notify(message) {
      this.snackbarText = message
      this.snackbar = true
    },
    exportExcel() {
      downloadExcel(this.filteredReports, this.$i18n.locale, this.$t.bind(this))
      this.notify(this.$t('Excel exported'))
    },
    async exportWeeklyPdf() {
      try {
        await downloadWeeklyPdf(this.filteredReports, this.$i18n.locale, this.$t.bind(this), this.appliedFilters)
        this.notify(this.$t('PDF exported'))
      } catch (_) {
        this.notify(this.$t('PDF export failed'))
      }
    },
    sendReportReminders() {
      this.notify(this.$t('Reminder demo'))
    },
  },
}
</script>
