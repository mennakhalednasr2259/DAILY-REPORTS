<template>
  <nav class="pagination" :aria-label="$t('Pagination')">
    <span class="pagination__summary">{{ $t('Page {page} of {total}', { page: currentPage, total: lastPage }) }}</span>
    <div class="pagination__buttons">
      <button class="page-button" type="button" :disabled="currentPage <= 1" :aria-label="$t('Previous')" @click="$emit('change', currentPage - 1)"><v-icon small>{{ $i18n.locale === 'ar' ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon></button>
      <button v-for="page in pages" :key="page" class="page-button" :class="{ 'page-button--active': currentPage === page }" type="button" :aria-current="currentPage === page ? 'page' : null" @click="$emit('change', page)">{{ page }}</button>
      <button class="page-button" type="button" :disabled="currentPage >= lastPage" :aria-label="$t('Next')" @click="$emit('change', currentPage + 1)"><v-icon small>{{ $i18n.locale === 'ar' ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon></button>
    </div>
  </nav>
</template>
<script>
export default {
  name: 'ReportPagination',
  props: { currentPage: { type: Number, required: true }, lastPage: { type: Number, required: true } },
  computed: {
    pages() {
      const start = Math.max(1, Math.min(this.currentPage - 2, this.lastPage - 4))
      return Array.from({ length: Math.min(5, this.lastPage) }, (_, index) => start + index)
    },
  },
}
</script>
