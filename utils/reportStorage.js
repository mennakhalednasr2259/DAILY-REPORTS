const STORAGE_KEY = 'daily-reports-records-v1'

export function loadReports(seedReports) {
  try {
    const savedReports = window.localStorage.getItem(STORAGE_KEY)
    if (!savedReports) {
      saveReports(seedReports)
      return seedReports
    }
    const parsedReports = JSON.parse(savedReports)
    return Array.isArray(parsedReports) ? parsedReports : seedReports
  } catch (_) {
    return seedReports
  }
}

export function saveReports(reports) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}
