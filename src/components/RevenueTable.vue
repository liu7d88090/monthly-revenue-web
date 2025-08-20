<script setup>
import { computed } from 'vue'

const props = defineProps({ rows: { type: Array, default: () => [] } })
const totalCount = computed(() => props.rows?.length || 0)

// 同時支援 camelCase / PascalCase
const pick = (o, keys, fallback = '') => {
  for (const k of keys) {
    const v = o?.[k]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return fallback
}

const viewRows = computed(() =>
  props.rows.map(r => ({
    reportDate:            pick(r, ['reportDate', 'ReportDate']),
    dataYearMonth:         pick(r, ['dataYearMonth', 'DataYearMonth', 'yearMonth', 'YearMonth']),
    companyCode:           pick(r, ['companyCode', 'CompanyCode']),
    companyName:           pick(r, ['companyName', 'CompanyName']),
    industry:              pick(r, ['industry', 'Industry']),
    revCurrent:            pick(r, ['rev_CurrentMonth', 'Rev_CurrentMonth', 'revenue', 'Revenue']),
    revPrev:               pick(r, ['rev_PreviousMonth', 'Rev_PreviousMonth']),
    revSameMonthLastYear:  pick(r, ['rev_SameMonthLastYear', 'Rev_SameMonthLastYear']),
    momPct:                pick(r, ['moM_ChangePct', 'MoM_ChangePct', 'momChangePct']),
    yoyPct:                pick(r, ['yoY_ChangePct', 'YoY_ChangePct', 'yoyPercent', 'YoyPercent']),
    accuCurrent:           pick(r, ['rev_Accu_CurrentYear', 'Rev_Accu_CurrentYear']),
    accuLast:              pick(r, ['rev_Accu_LastYear', 'Rev_Accu_LastYear']),
    accuYoyPct:            pick(r, ['accu_YoY_ChangePct', 'Accu_YoY_ChangePct']),
    notes:                 pick(r, ['notes', 'Notes'])
  }))
)

const nf = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 0 })
const pf = v =>
  (v === '' || v === null || v === undefined || Number.isNaN(Number(v)))
    ? ''
    : `${Number(v).toFixed(2)}%`

const trendClass = v => {
  const n = Number(v)
  return Number.isNaN(n) ? '' : (n >= 0 ? 'up' : 'down')
}
</script>

<template>
  <section class="card table-wrap">
    <div class="table-toolbar">
      <h2>查詢結果</h2>
      <div class="hint">總筆數：<strong>{{ totalCount }}</strong></div>
    </div>

    <div v-if="viewRows.length" class="table-scroll">
      <table class="table">
        <thead>
          <tr>
            <th style="min-width:110px;">出表日期</th>
            <th style="min-width:100px;">資料年月</th>
            <th style="min-width:100px;">公司代號</th>
            <th style="min-width:160px;">公司名稱</th>
            <th style="min-width:120px;">產業別</th>
            <th class="num" style="min-width:140px;">營業收入-當月營收</th>
            <th class="num" style="min-width:140px;">營業收入-上月營收</th>
            <th class="num" style="min-width:160px;">營業收入-去年當月營收</th>
            <th class="num" style="min-width:160px;">營業收入-上月比較增減(%)</th>
            <th class="num" style="min-width:160px;">營業收入-去年同月增減(%)</th>
            <th class="num" style="min-width:180px;">累計營業收入-當月累計營收</th>
            <th class="num" style="min-width:180px;">累計營業收入-去年累計營收</th>
            <th class="num" style="min-width:180px;">累計營業收入-前期比較增減(%)</th>
            <th style="min-width:200px;">備註</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in viewRows" :key="`${r.companyCode}-${r.dataYearMonth}`">
            <td>{{ r.reportDate || '—' }}</td>
            <td><span class="chip">{{ r.dataYearMonth || '—' }}</span></td>
            <td>{{ r.companyCode || '—' }}</td>
            <td>{{ r.companyName || '—' }}</td>
            <td>{{ r.industry || '—' }}</td>

            <td class="num">{{ r.revCurrent !== '' ? nf.format(r.revCurrent) : '' }}</td>
            <td class="num">{{ r.revPrev !== '' ? nf.format(r.revPrev) : '' }}</td>
            <td class="num">{{ r.revSameMonthLastYear !== '' ? nf.format(r.revSameMonthLastYear) : '' }}</td>

            <td class="num"><span class="pct" :class="trendClass(r.momPct)">{{ pf(r.momPct) }}</span></td>
            <td class="num"><span class="pct" :class="trendClass(r.yoyPct)">{{ pf(r.yoyPct) }}</span></td>

            <td class="num">{{ r.accuCurrent !== '' ? nf.format(r.accuCurrent) : '' }}</td>
            <td class="num">{{ r.accuLast !== '' ? nf.format(r.accuLast) : '' }}</td>
            <td class="num"><span class="pct" :class="trendClass(r.accuYoyPct)">{{ pf(r.accuYoyPct) }}</span></td>

            <td>{{ r.notes || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty">無資料</div>
  </section>
</template>
