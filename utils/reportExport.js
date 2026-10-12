import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

function localized(report, field, locale) {
  return report[field + (locale === 'ar' ? 'Ar' : 'En')] || report[field + 'En'] || ''
}

function dateLabel(value, locale) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value + 'T00:00:00'))
}

export function downloadExcel(reports, locale, translate) {
  const rows = reports.map(report => ({
    [translate('Report title')]: localized(report, 'title', locale),
    [translate('Author')]: localized(report, 'author', locale),
    [translate('Team')]: translate('Team ' + report.teamKey),
    [translate('Report date')]: report.reportDate,
    [translate('Status')]: translate(report.status === 'draft' ? 'Draft' : 'Submitted'),
    [translate('Summary')]: localized(report, 'summary', locale),
    [translate('Achievements')]: localized(report, 'achievements', locale),
    [translate('Blockers')]: localized(report, 'blockers', locale),
    [translate('Next steps')]: localized(report, 'nextSteps', locale),
  }))
  const sheet = XLSX.utils.json_to_sheet(rows)
  sheet['!cols'] = [{ wch: 34 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 55 }, { wch: 55 }, { wch: 42 }, { wch: 42 }]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, translate('Reports list').slice(0, 31))
  XLSX.writeFile(workbook, 'daily-reports-' + new Date().toISOString().slice(0, 10) + '.xlsx')
}

export async function downloadWeeklyPdf(reports, locale, translate, filters = {}) {
  const now = new Date()
  const localIso = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const hasSelectedDate = Boolean(filters.fromDate || filters.toDate)
  const startIso = hasSelectedDate ? (filters.fromDate || filters.toDate) : localIso(weekStart)
  const endIso = hasSelectedDate ? (filters.toDate || filters.fromDate) : localIso(weekEnd)
  const weeklyReports = reports.filter(report => report.reportDate >= startIso && report.reportDate <= endIso)
  const employeeNames = weeklyReports.map(report => localized(report, 'author', locale) || report.author || '').filter(Boolean)
  const employeeCount = new Set(employeeNames).size
  const getStatus = report => String(report.workflowStatus || report.workflow_status || report.status || '').toUpperCase()
  const approvedCount = weeklyReports.filter(report => getStatus(report) === 'APPROVED').length
  const pendingCount = weeklyReports.filter(report => ['PENDING_APPROVAL', 'SUBMITTED'].includes(getStatus(report))).length
  const stats = [
    { value: weeklyReports.length, label: translate('Total reports'), color: '#24343a' },
    { value: employeeCount, label: translate('Employees count'), color: '#24343a' },
    { value: approvedCount, label: translate('Approved reports'), color: '#008f7a' },
    { value: pendingCount, label: translate('Under review'), color: '#b85b00' },
  ].map(item => `<div style="text-align:center;color:${item.color}"><strong style="display:block;font-size:23px;line-height:1.25">${item.value}</strong><span style="font-size:10px;color:#80909d;text-decoration:underline;text-underline-offset:3px">${escapeHtml(item.label)}</span></div>`).join('')
  const cards = weeklyReports.map(report => {
    const title = localized(report, 'title', locale) || translate('Daily Report')
    const author = localized(report, 'author', locale) || report.author || ''
    const body = localized(report, 'summary', locale) || report['reportText' + (locale === 'ar' ? 'Ar' : 'En')] || report.report_text || ''
    const text = htmlToText(body)
    return `<article style="border:1px solid #dfe5eb;border-radius:9px;padding:15px 18px;margin:0 0 12px;break-inside:avoid;background:#fff">
      <header style="display:flex;justify-content:space-between;gap:18px;margin-bottom:7px"><strong style="font-size:15px">${escapeHtml(title)}</strong><span style="white-space:nowrap;color:#60717c;font-size:10px">${escapeHtml(dateLabel(report.reportDate, locale))}</span></header>
      <p style="margin:0 0 8px;color:#60717c;font-size:11px">${escapeHtml(author)}${report.teamKey ? ' · ' + escapeHtml(translate('Team ' + report.teamKey)) : ''}</p>
      ${text ? `<p style="margin:0;white-space:pre-wrap;line-height:1.7">${escapeHtml(text)}</p>` : ''}
    </article>`
  }).join('')
  const container = document.createElement('div')
  container.lang = locale
  container.dir = locale === 'ar' ? 'rtl' : 'ltr'
  Object.assign(container.style, {
    position: 'fixed', left: '-10000px', top: '0', width: '794px', padding: '44px 45px 52px',
    boxSizing: 'border-box', background: '#fff', color: '#202b36', font: '12px/1.7 Arial, Tahoma, sans-serif',
  })
  const extractedAt = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(now)
  container.innerHTML = `<div style="display:flex;justify-content:space-between;gap:18px;padding-bottom:8px;border-bottom:1px solid #d9e0e5;color:#8292a0;font-size:9px"><span>${escapeHtml(startIso)} – ${escapeHtml(endIso)}</span><span>${escapeHtml(translate('Weekly reports'))} • ${escapeHtml(translate('Super Admin'))}</span></div>
    <header style="margin:34px 0 20px;padding:23px 24px;border-radius:9px;background:#1e4039;color:#fff">
      <div style="color:#9bd6c9;font-size:11px">${escapeHtml(translate('Super Admin'))}</div>
      <h1 style="font-size:21px;margin:4px 0 5px">${escapeHtml(translate('Weekly reports'))}</h1>
      <p style="margin:0;color:#d6e5e1;font-size:10px">${escapeHtml(translate('Selected period'))}: ${escapeHtml(dateLabel(startIso, locale))} ${escapeHtml(translate('To date'))} ${escapeHtml(dateLabel(endIso, locale))} &nbsp; | &nbsp; ${escapeHtml(translate('Extracted at'))}: ${escapeHtml(extractedAt)}</p>
    </header>
    <section style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:18px 0 26px">${stats}</section>
    ${cards || `<div style="min-height:176px;padding:35px 18px;border:2px dashed #c9d5e0;border-radius:10px;background:#f8fafc;text-align:center;display:grid;align-content:center;justify-items:center"><div style="width:28px;height:28px;margin-bottom:10px;border:1px solid #83909a;border-radius:3px;font-size:18px;line-height:26px">?</div><strong style="font-size:14px;margin-bottom:4px">${escapeHtml(translate('No weekly reports'))}</strong><span style="font-size:11px;color:#83909a">${escapeHtml(translate('No weekly reports hint'))}</span></div>`}`
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true })
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
    const pageWidth = 210
    const pageHeight = 297
    const sliceHeight = Math.floor(canvas.width * pageHeight / pageWidth)
    let pageIndex = 0

    for (let offset = 0; offset < canvas.height; offset += sliceHeight) {
      const currentHeight = Math.min(sliceHeight, canvas.height - offset)
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = currentHeight
      const context = pageCanvas.getContext('2d')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      context.drawImage(canvas, 0, offset, canvas.width, currentHeight, 0, 0, canvas.width, currentHeight)
      if (pageIndex > 0) pdf.addPage()
      pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, pageWidth, currentHeight * pageWidth / canvas.width, undefined, 'FAST')
      pageIndex += 1
    }

    pdf.save('weekly-reports-' + new Date().toISOString().slice(0, 10) + '.pdf')
    return weeklyReports.length
  } finally {
    container.remove()
  }
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

function htmlToText(value) {
  const element = document.createElement('div')
  element.innerHTML = String(value || '')
  return (element.textContent || '').trim()
}
