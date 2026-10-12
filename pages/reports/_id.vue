<template>
  <main class="reports-page report-detail-page">
    <div class="detail-page-heading">
      <button class="icon-action" type="button" :aria-label="$t('Back to reports')" @click="goBack"><v-icon>mdi-arrow-left-circle-outline</v-icon></button>
      <h1>{{ $t('Daily Report') }}</h1>
      <report-locale-toggle />
          <report-theme-toggle />
    </div>

    <template v-if="report">
      <div class="report-content">
        <div class="report-meta">
          <p v-if="author"><strong>{{ $t('Author') }}:</strong> {{ author }}</p>
          <p v-if="createdBy"><strong>{{ $t('Written by') }}:</strong> {{ createdBy }}</p>
          <p><strong>{{ $t('Date') }}:</strong> {{ formatDate(report.reportDate || report.report_date || report.createdAt || report.created_at) }}</p>
          <p v-if="report.workflowStatus || report.workflow_status || report.status"><strong>{{ $t('Status') }}:</strong> {{ workflowLabel }}</p>
          <p v-if="approvedBy || approvedAt" class="approval-meta"><strong>{{ $t('Approved by') }}:</strong> {{ approvedBy || '—' }}<span v-if="approvedAt"> — {{ formatDateTime(approvedAt) }}</span></p>
          <p v-if="rejectedBy || rejectedAt" class="rejection-meta"><strong>{{ $t('Rejected by') }}:</strong> {{ rejectedBy || '—' }}<span v-if="rejectedAt"> — {{ formatDateTime(rejectedAt) }}</span></p>
        </div>

        <section v-if="rejectionReason" class="rejection-box">
          <h2>{{ $t('Rejection reason') }}</h2><p>{{ rejectionReason }}</p>
        </section>

        <section v-if="editing" class="report-body report-edit-box">
          <h2>{{ $t('Edit report') }}</h2>
          <div class="editor-toolbar" role="toolbar" :aria-label="$t('Report formatting')">
            <button v-for="tool in formattingTools" :key="tool.command" class="editor-tool" type="button" :aria-label="$t(tool.label)" :title="$t(tool.label)" @mousedown.prevent="formatText(tool.command)"><v-icon small>{{ tool.icon }}</v-icon></button>
          </div>
          <div ref="editEditor" class="report-editor-input" contenteditable="true" role="textbox" aria-multiline="true" :data-placeholder="$t('Write report placeholder')" :aria-label="$t('Write your daily report')" @input="syncEditEditor" />
          <div class="create-actions">
            <button class="button button-secondary" type="button" @click="cancelEdit">{{ $t('Cancel') }}</button>
            <button class="button button-primary" type="button" @click="saveEdit">{{ $t('Save changes') }}</button>
          </div>
        </section>
        <article v-else class="report-body report-body-content" v-html="safeReportHtml" />

        <div v-if="!editing" class="report-edit-action">
          <button class="button button-secondary" type="button" @click="startEdit"><v-icon small>mdi-pencil-outline</v-icon>{{ $t('Edit report') }}</button>
        </div>

        <section v-if="adminComment" class="admin-comment-box">
          <h2>{{ $t('Admin Comment') }}</h2>
          <p v-if="report.adminCommentBy || report.admin_comment_by" class="comment-meta">{{ report.adminCommentBy || report.admin_comment_by }}<span v-if="report.adminCommentedAt || report.admin_commented_at"> — {{ formatDateTime(report.adminCommentedAt || report.admin_commented_at) }}</span></p>
          <p class="comment-text">{{ adminComment }}</p>
        </section>

        <section class="admin-comment-form">
          <h2>{{ $t('Add Admin Comment') }}</h2>
          <label class="filter-field"><textarea v-model="adminCommentDraft" rows="4" :placeholder="$t('Admin comment on this report')" /></label>
          <button class="button button-primary action-spacing" type="button" @click="saveComment">{{ $t('Save Comment') }}</button>
          <div class="workflow-actions">
            <button class="button button-primary" type="button" @click="approveReport">{{ $t('Approve report') }}</button>
            <button class="button button-danger" type="button" @click="openRejectDialog">{{ $t('Reject report') }}</button>
          </div>
        </section>

        <section class="review-box">
          <h2>{{ $t('How Do You Rate This Report ?') }}</h2>
          <article v-for="item in displayedReviews" :key="item.id" class="existing-review">
            <div class="review-heading"><span class="review-stars" :aria-label="$t('Rating') + ': ' + item.rating + '/5'">{{ '★'.repeat(item.rating) }}<span class="star-off">{{ '★'.repeat(5 - item.rating) }}</span></span><span class="comment-meta">{{ item.reviewerName || item.reviewer_name }}</span></div>
            <p v-if="item.reviewText || item.review_text" class="review-text">{{ item.reviewText || item.review_text }}</p>
          </article>
          <div class="rating-picker" role="radiogroup" :aria-label="$t('Choose a rating')">
            <button v-for="rating in 5" :key="rating" type="button" role="radio" :aria-checked="reviewRating === rating" :aria-label="rating + '/5'" @click="reviewRating = rating"><v-icon :color="rating <= reviewRating ? 'amber darken-2' : 'grey lighten-1'">mdi-star</v-icon></button>
          </div>
          <label class="filter-field"><textarea v-model="reviewText" rows="3" :placeholder="$t('Add Review About This Report')" /></label>
          <button class="button button-primary action-spacing" type="button" :disabled="!reviewRating" @click="submitReview">{{ $t('Send Report Reply') }}</button>
        </section>
      </div>
      <v-dialog v-model="rejectDialog" max-width="480">
        <v-card class="reject-dialog">
          <div class="reject-dialog__icon"><v-icon color="error">mdi-close-circle-outline</v-icon></div>
          <h2>{{ $t('Reject report') }}</h2>
          <p>{{ $t('Rejection reason') }}</p>
          <label class="filter-field"><textarea v-model="rejectionReasonDraft" rows="4" :placeholder="$t('Rejection reason')" /></label>
          <p v-if="rejectError" class="form-error">{{ rejectError }}</p>
          <div class="create-actions">
            <button class="button button-secondary" type="button" :disabled="rejecting" @click="closeRejectDialog">{{ $t('Cancel') }}</button>
            <button class="button button-danger" type="button" :disabled="rejecting" @click="confirmRejectReport">{{ $t('Reject report') }}</button>
          </div>
        </v-card>
      </v-dialog>
    </template>
    <section v-else class="empty-state"><span class="empty-icon"><v-icon>mdi-file-alert-outline</v-icon></span><h2>{{ $t('Report not found') }}</h2><button class="button button-secondary" type="button" @click="goBack">{{ $t('Back to reports') }}</button></section>
    <v-snackbar v-model="snackbar" :timeout="2600" color="secondary">{{ snackbarText }}</v-snackbar>
  </main>
</template>

<script>
import ReportLocaleToggle from '~/components/ReportLocaleToggle.vue'
import ReportThemeToggle from '~/components/ReportThemeToggle.vue'
import { loadReports, saveReports } from '~/utils/reportStorage'
import { getSeedReports } from '~/utils/reportData'
import { sanitizeReportHtml } from '~/utils/sanitizeReportHtml'

export default {
  name: 'DailyReportDetailsPage',
  components: { ReportLocaleToggle, ReportThemeToggle },
  data() { return {
    report: null,
    editing: false,
    editedText: '',
    adminCommentDraft: '',
    reviewRating: 0,
    reviewText: '',
    rejectDialog: false,
    rejectionReasonDraft: '',
    rejectError: '',
    rejecting: false,
    snackbar: false,
    snackbarText: '',
    formattingTools: [
      { command: 'bold', label: 'Bold', icon: 'mdi-format-bold' },
      { command: 'italic', label: 'Italic', icon: 'mdi-format-italic' },
      { command: 'underline', label: 'Underline', icon: 'mdi-format-underline' },
      { command: 'insertOrderedList', label: 'Numbered list', icon: 'mdi-format-list-numbered' },
      { command: 'insertUnorderedList', label: 'Bullet list', icon: 'mdi-format-list-bulleted' },
      { command: 'removeFormat', label: 'Clear formatting', icon: 'mdi-format-clear' },
    ],
  } },
  computed: {
    author() { return this.report ? (this.report['author' + (this.$i18n.locale === 'ar' ? 'Ar' : 'En')] || this.report.author || this.report.author_name || '') : '' },
    createdBy() { return this.report ? (this.report['createdBy' + (this.$i18n.locale === 'ar' ? 'Ar' : 'En')] || this.report.createdBy || this.report.created_by_name || '') : '' },
    workflowLabel() {
      const rawStatus = this.report && (this.report.workflowStatus || this.report.workflow_status)
      const status = String(rawStatus || (this.report && (this.report.status === 'draft' || this.report.isDraft) ? 'DRAFT' : 'PENDING_APPROVAL')).toUpperCase()
      const labels = { DRAFT: 'Draft', PENDING_APPROVAL: 'Pending approval', APPROVED: 'Approved', REJECTED: 'Rejected' }
      return this.$t(labels[status] || 'Submitted')
    },
    approvedBy() { return this.report && (this.report.approvedBy || this.report.approved_by) },
    approvedAt() { return this.report && (this.report.approvedAt || this.report.approved_at) },
    rejectedBy() { return this.report && (this.report.rejectedBy || this.report.rejected_by) },
    rejectedAt() { return this.report && (this.report.rejectedAt || this.report.rejected_at) },
    rejectionReason() { return this.report && (this.report.rejectionReason || this.report.rejection_reason) },
    adminComment() { return this.report && (this.report.adminComment || this.report.admin_comment) },
    displayedReviews() {
      if (!this.report) return []
      if (Array.isArray(this.report.reviews) && this.report.reviews.length) return this.report.reviews
      return this.report.review ? [this.report.review] : []
    },
    reportText() {
      if (!this.report) return ''
      return this.report['reportText' + (this.$i18n.locale === 'ar' ? 'Ar' : 'En')] || this.report.report_text || this.report.summary || this.report.summaryAr || this.report.summaryEn || ''
    },
    safeReportHtml() { return sanitizeReportHtml(this.reportText) },
  },
  watch: { '$i18n.locale'() { document.title = this.$t('Daily Report') } },
  mounted() {
    document.title = this.$t('Daily Report')
    const reports = loadReports(getSeedReports())
    this.report = reports.find(item => String(item.id) === String(this.$route.params.id)) || null
    this.editedText = this.reportText
    this.adminCommentDraft = this.adminComment || ''
  },
  methods: {
    goBack() { this.$router.push('/') },
    formatDate(value) {
      if (!value) return '—'
      const date = new Date(value.length === 10 ? value + 'T00:00:00' : value)
      return new Intl.DateTimeFormat(this.$i18n.locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
    },
    formatDateTime(value) {
      if (!value) return ''
      const date = new Date(value)
      return new Intl.DateTimeFormat(this.$i18n.locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    },
    startEdit() {
      this.editing = true
      this.$nextTick(() => { if (this.$refs.editEditor) this.$refs.editEditor.innerHTML = this.reportText })
    },
    syncEditEditor() { this.editedText = this.$refs.editEditor ? this.$refs.editEditor.innerHTML : '' },
    formatText(command) {
      this.$refs.editEditor.focus()
      document.execCommand(command, false, null)
      this.syncEditEditor()
    },
    cancelEdit() { this.editedText = this.reportText; this.editing = false },
    persistReport(updates, successMessage) {
      const reports = loadReports(getSeedReports())
      const index = reports.findIndex(item => String(item.id) === String(this.report.id))
      if (index < 0) return false
      reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() }
      try {
        saveReports(reports)
        this.report = reports[index]
        this.snackbarText = this.$t(successMessage)
        this.snackbar = true
        return true
      } catch (_) {
        this.snackbarText = this.$t('Storage unavailable')
        this.snackbar = true
        return false
      }
    },
    saveEdit() {
      this.syncEditEditor()
      if (!this.editedText.replace(/<[^>]*>/g, '').trim()) { this.snackbarText = this.$t('Required field'); this.snackbar = true; return }
      const localeSuffix = this.$i18n.locale === 'ar' ? 'Ar' : 'En'
      const safeHtml = sanitizeReportHtml(this.editedText.trim())
      const updates = { ['reportText' + localeSuffix]: safeHtml, ['summary' + localeSuffix]: safeHtml.replace(/<[^>]*>/g, ' ') }
      if (this.persistReport(updates, 'Report updated')) this.editing = false
    },
    saveComment() {
      const comment = this.adminCommentDraft.trim()
      if (!comment) { this.snackbarText = this.$t('Required field'); this.snackbar = true; return }
      this.persistReport({ adminComment: comment, adminCommentBy: this.$t('Demo manager'), adminCommentedAt: new Date().toISOString() }, 'Comment saved')
    },
    approveReport() {
      this.persistReport({ workflowStatus: 'APPROVED', status: 'approved', approvedBy: this.$t('Demo manager'), approvedAt: new Date().toISOString(), rejectedBy: '', rejectedAt: '', rejectionReason: '' }, 'Report approved')
    },
    openRejectDialog() { this.rejectionReasonDraft = ''; this.rejectError = ''; this.rejectDialog = true },
    closeRejectDialog() { this.rejectDialog = false; this.rejecting = false; this.rejectError = ''; this.rejectionReasonDraft = '' },
    confirmRejectReport() {
      const reason = this.rejectionReasonDraft.trim()
      if (!reason) { this.rejectError = this.$t('Required field'); return }
      this.rejecting = true
      const saved = this.persistReport({ workflowStatus: 'REJECTED', status: 'rejected', rejectedBy: this.$t('Demo manager'), rejectedAt: new Date().toISOString(), rejectionReason: reason, approvedBy: '', approvedAt: '' }, 'Report rejected')
      if (saved) this.closeRejectDialog()
      else this.rejecting = false
    },
    submitReview() {
      if (!this.reviewRating) return
      const reviews = [...this.displayedReviews, { id: Date.now(), rating: this.reviewRating, reviewText: this.reviewText.trim(), reviewerName: this.$t('Demo manager'), createdAt: new Date().toISOString() }]
      if (this.persistReport({ reviews }, 'Review submitted')) { this.reviewRating = 0; this.reviewText = '' }
    },
  },
}
</script>

