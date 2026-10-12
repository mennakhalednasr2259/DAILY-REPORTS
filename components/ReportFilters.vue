<template>
  <section class="filters-panel" :aria-label="$t('Filter reports')">
    <div class="filters-grid report-filter-grid">
      <div class="filter-field">
        <span>{{ $t('Date Range') }}</span>
        <v-menu v-model="dateMenu" :close-on-content-click="false" offset-y min-width="290">
          <template v-slot:activator="{ on, attrs }">
            <button class="date-range-trigger" type="button" v-bind="attrs" v-on="on">
              <v-icon small>mdi-calendar-range</v-icon>
              <span>{{ dateRangeLabel || $t('Date Range') }}</span>
            </button>
          </template>
          <v-date-picker :value="selectedDates" :locale="$i18n.locale" range scrollable @input="updateDates">
            <v-spacer />
            <v-btn text color="primary" @click="dateMenu = false">{{ $t('Cancel') }}</v-btn>
            <v-btn text color="primary" @click="applyDateRange">{{ $t('OK') }}</v-btn>
          </v-date-picker>
        </v-menu>
      </div>

      <label class="filter-field">
        <span>{{ $t('Team') }}</span>
        <select :value="value.team" @change="setTeam($event.target.value)">
          <option value="">{{ $t('All teams') }}</option>
          <option v-for="team in teams" :key="team.key" :value="team.key">{{ team.label }}</option>
        </select>
      </label>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ReportFilters',
  props: {
    value: { type: Object, required: true },
    teams: { type: Array, default: () => [] },
  },
  data() { return { dateMenu: false } },
  computed: {
    selectedDates() {
      return [this.value.fromDate, this.value.toDate].filter(Boolean)
    },
    dateRangeLabel() {
      const { fromDate, toDate } = this.value
      if (!fromDate && !toDate) return ''
      const format = value => value ? new Intl.DateTimeFormat(this.$i18n.locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value + 'T00:00:00')) : ''
      return fromDate && toDate ? `${format(fromDate)} — ${format(toDate)}` : format(fromDate || toDate)
    },
  },
  methods: {
    updateDates(dates) {
      const selected = Array.isArray(dates) ? dates : []
      this.$emit('input', { ...this.value, fromDate: selected[0] || '', toDate: selected[1] || '' })
    },
    applyDateRange() {
      this.dateMenu = false
      this.$emit('apply')
    },
    setTeam(team) {
      this.$emit('input', { ...this.value, team })
      this.$emit('apply')
    },
  },
}
</script>
