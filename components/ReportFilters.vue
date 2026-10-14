<template>
  <section class="filters-panel" :aria-label="$t('Filter reports')">
    <div class="filters-grid report-filter-grid">
      <fieldset class="date-filter-group">
        <legend>{{ $t('Report period') }}</legend>
        <div class="date-filter-group__fields">
          <div class="filter-field">
            <span>{{ $t('From date') }}</span>
            <v-menu v-model="fromDateMenu" :close-on-content-click="false" offset-y min-width="290">
              <template v-slot:activator="{ on, attrs }">
                <button class="date-range-trigger" type="button" :aria-label="$t('From date')" v-bind="attrs" v-on="on">
                  <v-icon small>mdi-calendar-range</v-icon>
                  <span :key="$i18n.locale">{{ formatDate(value.fromDate) || $t('Choose date') }}</span>
                </button>
              </template>
              <v-date-picker :value="draftFromDate" :locale="$i18n.locale" :max="value.toDate || undefined" color="primary" @input="draftFromDate = $event">
                <v-spacer />
                <v-btn text color="primary" @click="fromDateMenu = false">{{ $t('Cancel') }}</v-btn>
                <v-btn text color="primary" @click="applyDate('fromDate')">{{ $t('OK') }}</v-btn>
              </v-date-picker>
            </v-menu>
          </div>
          <div class="filter-field">
            <span>{{ $t('To date') }}</span>
            <v-menu v-model="toDateMenu" :close-on-content-click="false" offset-y min-width="290">
              <template v-slot:activator="{ on, attrs }">
                <button class="date-range-trigger" type="button" :aria-label="$t('To date')" v-bind="attrs" v-on="on">
                  <v-icon small>mdi-calendar-range</v-icon>
                  <span :key="$i18n.locale">{{ formatDate(value.toDate) || $t('Choose date') }}</span>
                </button>
              </template>
              <v-date-picker :value="draftToDate" :locale="$i18n.locale" :min="value.fromDate || undefined" color="primary" @input="draftToDate = $event">
                <v-spacer />
                <v-btn text color="primary" @click="toDateMenu = false">{{ $t('Cancel') }}</v-btn>
                <v-btn text color="primary" @click="applyDate('toDate')">{{ $t('OK') }}</v-btn>
              </v-date-picker>
            </v-menu>
          </div>
        </div>
      </fieldset>

      <div class="filter-field">
        <span>{{ $t('Team') }}</span>
        <v-select
          class="team-filter-select"
          :value="value.team"
          :items="teamOptions"
          item-text="label"
          item-value="key"
          :menu-props="{ contentClass: 'team-filter-menu' }"
          :aria-label="$t('Team')"
          outlined
          dense
          hide-details
          @change="setTeam"
        >
          <template v-slot:selection="{ item }">
            <span class="team-filter-selection">
              <v-icon small aria-hidden="true">{{ item.isAll ? 'mdi-account-multiple-outline' : 'mdi-account-group-outline' }}</v-icon>
              <span>{{ item.label }}</span>
            </span>
          </template>
          <template v-slot:item="{ item, attrs, on }">
            <v-list-item v-bind="attrs" v-on="on" class="team-filter-option">
              <v-list-item-avatar class="team-filter-option__avatar" size="34">
                <v-icon small aria-hidden="true">{{ item.isAll ? 'mdi-account-multiple-outline' : 'mdi-account-group-outline' }}</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="team-filter-option__title">{{ item.label }}</v-list-item-title>
              </v-list-item-content>
              <v-icon v-if="String(value.team) === String(item.key)" small class="team-filter-option__check" aria-hidden="true">
                mdi-check-circle
              </v-icon>
            </v-list-item>
          </template>
        </v-select>
      </div>

      <div class="filter-actions">
        <button class="button button-primary" type="button" @click="$emit('apply')"><v-icon small>mdi-magnify</v-icon>{{ $t('Search') }}</button>
        <button class="button button-secondary" type="button" @click="resetFilters">{{ $t('Reset filters') }}</button>
      </div>
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
  data() { return { fromDateMenu: false, toDateMenu: false, draftFromDate: '', draftToDate: '' } },
  computed: {
    teamOptions() {
      return [
        { key: '', label: this.$t('All teams'), isAll: true },
        ...this.teams.map(team => ({ ...team, isAll: false })),
      ]
    },
  },
  watch: {
    fromDateMenu(isOpen) { if (isOpen) this.draftFromDate = this.value.fromDate },
    toDateMenu(isOpen) { if (isOpen) this.draftToDate = this.value.toDate },
  },
  methods: {
    formatDate(value) {
      if (!value) return ''
      return new Intl.DateTimeFormat(this.$i18n.locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value + 'T00:00:00'))
    },
    applyDate(field) {
      const date = field === 'fromDate' ? this.draftFromDate : this.draftToDate
      this.$emit('input', { ...this.value, [field]: date || '' })
      this[field === 'fromDate' ? 'fromDateMenu' : 'toDateMenu'] = false
    },
    setTeam(team) {
      this.$emit('input', { ...this.value, team })
    },
    resetFilters() {
      this.$emit('input', { team: '', fromDate: '', toDate: '' })
      this.$emit('apply')
    },
  },
}
</script>
