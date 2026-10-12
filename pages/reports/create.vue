<template>
  <main class="reports-page report-form-page">
    <div class="detail-page-heading">
      <button class="icon-action" type="button" :aria-label="$t('Back to reports')" @click="goBack"><v-icon>mdi-arrow-left-circle-outline</v-icon></button>
      <h1>{{ $t('Daily Report') }}</h1>
      <report-locale-toggle />
          <report-theme-toggle />
    </div>

    <section class="report-create-panel">
      <section class="report-manager-panel" :aria-label="$t('Report assignment')">
        <p>{{ $t('Choose whether this report is for you or for another employee') }}</p>
        <v-btn-toggle v-model="reportMode" mandatory dense class="report-mode-toggle">
          <v-btn>{{ $t('My Report') }}</v-btn>
          <v-btn>{{ $t('Report For Employee') }}</v-btn>
        </v-btn-toggle>
        <label v-if="reportMode === 1" class="filter-field report-assignee-field">
          <span>{{ $t('Assign report to user') }}</span>
          <select v-model="authorId">
            <option value="">{{ $t('Choose an employee') }}</option>
            <option v-for="member in members" :key="member.id" :value="member.id">{{ member['name' + localeSuffix] }}</option>
          </select>
        </label>
      </section>
      <div class="report-create-meta">
        <div class="filter-field report-date-field">
          <span>{{ $t('Report date') }}</span>
          <v-menu v-model="dateMenu" :close-on-content-click="false" offset-y min-width="290">
            <template v-slot:activator="{ on, attrs }">
              <button class="date-range-trigger report-date-trigger" type="button" v-bind="attrs" v-on="on">
                <v-icon small>mdi-calendar-month-outline</v-icon>
                <span>{{ formattedReportDate }}</span>
              </button>
            </template>
            <v-date-picker :value="reportDate" :locale="$i18n.locale" color="primary" @input="selectReportDate" />
          </v-menu>
        </div>
      </div>

      <div class="report-writing-area">
        <label class="editor-label" for="daily-report-text">{{ $t('Write your daily report') }}</label>
        <div class="template-toolbar">
          <span class="template-label">{{ $t('Quick templates') }}:</span>
          <button v-for="item in templates" :key="item.key" class="button button-secondary template-button" type="button" @click="applyTemplate(item)">{{ $t(item.label) }}</button>
          <button class="button button-secondary template-button" type="button" @click="importCompletedTasks">{{ $t('Import completed tasks') }}</button>
        </div>
        <div class="editor-toolbar" role="toolbar" :aria-label="$t('Report formatting')">
          <button v-for="tool in formattingTools" :key="tool.command" class="editor-tool" type="button" :aria-label="$t(tool.label)" :title="$t(tool.label)" @mousedown.prevent="formatText(tool.command)"><v-icon small>{{ tool.icon }}</v-icon></button>
        </div>
        <div id="daily-report-text" ref="editor" class="report-editor-input" contenteditable="true" role="textbox" aria-multiline="true" :data-placeholder="$t('Write report placeholder')" :aria-invalid="showError && !reportText" @input="syncEditor" />
        <p v-if="showError && !reportText" class="form-error">{{ $t('Required field') }}</p>
      </div>

      <footer class="create-actions">
        <button class="button button-secondary" type="button" @click="saveReport('draft')">{{ $t('Save draft') }}</button>
        <button class="button button-primary" type="button" @click="saveReport('submitted')">{{ $t('Submit Daily Report') }}</button>
      </footer>
    </section>
    <v-snackbar v-model="snackbar" :timeout="2600" color="secondary">{{ snackbarText }}</v-snackbar>
  </main>
</template>

<script>
import ReportLocaleToggle from '~/components/ReportLocaleToggle.vue'
import ReportThemeToggle from '~/components/ReportThemeToggle.vue'
import { loadReports, saveReports } from '~/utils/reportStorage'
import { getSeedReports } from '~/utils/reportData'
import { sanitizeReportHtml } from '~/utils/sanitizeReportHtml'

const localDate = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')

export default {
  name: 'CreateDailyReportPage',
  components: { ReportLocaleToggle, ReportThemeToggle },
  data() {
    return {
      reportDate: localDate(new Date()),
      dateMenu: false,
      reportMode: 0,
      authorId: '',
      members: [
        { id: 'menna', nameAr: 'منة الله خالد', nameEn: 'Menna Khaled', teamKey: 'frontend' },
        { id: 'ahmed', nameAr: 'أحمد توفيق', nameEn: 'Ahmed Tawfik', teamKey: 'frontend' },
        { id: 'sara', nameAr: 'سارة محمود', nameEn: 'Sarah Mahmoud', teamKey: 'testing' },
        { id: 'omar', nameAr: 'عمر خالد', nameEn: 'Omar Khaled', teamKey: 'backend' },
      ],
      reportText: '',
      showError: false,
      snackbar: false,
      snackbarText: '',
      formattingTools: [
        { command: 'bold', label: 'Bold', icon: 'mdi-format-bold' },
        { command: 'italic', label: 'Italic', icon: 'mdi-format-italic' },
        { command: 'underline', label: 'Underline', icon: 'mdi-format-underline' },
        { command: 'insertOrderedList', label: 'Numbered list', icon: 'mdi-format-list-numbered' },
        { command: 'insertUnorderedList', label: 'Bullet list', icon: 'mdi-format-list-bulleted' },
        { command: 'createLink', label: 'Insert link', icon: 'mdi-link-variant' },
        { command: 'removeFormat', label: 'Clear formatting', icon: 'mdi-format-clear' },
      ],
    }
  },
  computed: {
    localeSuffix() { return this.$i18n.locale === 'ar' ? 'Ar' : 'En' },
    formattedReportDate() {
      if (!this.reportDate) return this.$t('Select report date')
      const [year, month, day] = this.reportDate.split('-').map(Number)
      return new Intl.DateTimeFormat(this.$i18n.locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(year, month - 1, day))
    },
    templates() {
      return [
        { key: 'full', label: 'Full daily template', html: '<h3>' + this.$t('Today achievements') + '</h3><p><br></p><h3>' + this.$t('Problems') + '</h3><p><br></p><h3>' + this.$t('Tomorrow plan') + '</h3><p><br></p>' },
        { key: 'achievements', label: 'Today achievements', html: '<h3>' + this.$t('Today achievements') + '</h3><ul><li><br></li></ul>' },
        { key: 'problems', label: 'Problems', html: '<h3>' + this.$t('Problems') + '</h3><ul><li><br></li></ul>' },
        { key: 'tomorrow', label: 'Tomorrow plan', html: '<h3>' + this.$t('Tomorrow plan') + '</h3><ul><li><br></li></ul>' },
      ]
    },
  },
  watch: { '$i18n.locale'() { document.title = this.$t('Create report') } },
  mounted() { document.title = this.$t('Create report') },
  methods: {
    goBack() { this.$router.push('/') },
    selectReportDate(date) {
      this.reportDate = date
      this.dateMenu = false
    },
    syncEditor() {
      this.reportText = this.$refs.editor ? this.$refs.editor.innerHTML : ''
    },
    formatText(command) {
      this.$refs.editor.focus()
      const value = command === 'createLink' ? window.prompt(this.$t('Enter link URL')) : null
      if (command === 'createLink' && !value) return
      document.execCommand(command, false, value)
      this.syncEditor()
    },
    applyTemplate(template) {
      this.$refs.editor.innerHTML = template.html
      this.syncEditor()
    },
    importCompletedTasks() {
      const html = '<h3>' + this.$t('Today achievements') + '</h3><ul><li>' + this.$t('Demo completed task one') + '</li><li>' + this.$t('Demo completed task two') + '</li></ul>'
      this.$refs.editor.innerHTML = (this.$refs.editor.innerHTML || '') + html
      this.syncEditor()
      this.snackbarText = this.$t('Completed tasks added')
      this.snackbar = true
    },
    saveReport(status) {
      this.showError = true
      if (!this.reportDate || !this.reportText.replace(/<[^>]*>/g, '').trim()) return
      if (this.reportMode === 1 && !this.authorId) {
        this.snackbarText = this.$t('Please select an employee')
        this.snackbar = true
        return
      }
      const reports = loadReports(getSeedReports())
      const now = new Date().toISOString()
      const safeReportHtml = sanitizeReportHtml(this.reportText)
      const locale = this.$i18n.locale === 'ar' ? 'Ar' : 'En'
      const author = this.reportMode === 1
        ? this.members.find(member => member.id === this.authorId)
        : this.members[0]
      const report = {
        id: 'RPT-' + Date.now(), reportDate: this.reportDate, createdAt: now, updatedAt: now,
        authorAr: author.nameAr, authorEn: author.nameEn, createdByAr: 'منة الله خالد', createdByEn: 'Menna Khaled',
        teamKey: author.teamKey, status, isDraft: status === 'draft',
        reportTextAr: safeReportHtml, reportTextEn: safeReportHtml,
        titleAr: this.$t('Daily Report'), titleEn: this.$t('Daily Report'),
        summaryAr: safeReportHtml.replace(/<[^>]*>/g, ' '), summaryEn: safeReportHtml.replace(/<[^>]*>/g, ' '),
      }
      report['reportText' + locale] = safeReportHtml
      reports.unshift(report)
      try {
        saveReports(reports)
        localStorage.setItem('daily-reports-flash', this.$t(status === 'draft' ? 'Report draft saved' : 'Report created'))
        this.$router.push('/')
      } catch (_) {
        this.snackbarText = this.$t('Storage unavailable')
        this.snackbar = true
      }
    },
  },
}
</script>
