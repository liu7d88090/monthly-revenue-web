<script setup>
import { computed } from 'vue'
const props = defineProps({ rows: { type: Array, default: () => [] } })
const totalCount = computed(() => props.rows?.length || 0)
function round2(v) {
  if (v === null || v === undefined || v === '') return ''
  const n = Number(v)
  if (Number.isNaN(n)) return ''
  return Math.round(n * 100) / 100
}
function badgeClass(v) {
  if (v === null || v === undefined || v === '') return 'badge'
  const n = Number(v)
  if (Number.isNaN(n)) return 'badge'
  return `badge ${n >= 0 ? 'ok' : 'warn'}`
}
</script>

<template>
  <div class="card">
    <div class="flex" style="justify-content: space-between;">
      <h1>查詢結果</h1>
      <div>總筆數：<strong>{{ totalCount }}</strong></div>
    </div>
    <table v-if="rows && rows.length">
      <thead>
        <tr>
          <th>公司代號</th>
          <th>年月</th>
          <th>營業收入</th>
          <th>去年同月增減(%)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, idx) in rows" :key="idx">
          <td>{{ r.companyCode ?? r.CompanyCode }}</td>
          <td>{{ r.yearMonth ?? r.YearMonth }}</td>
          <td>{{ r.revenue ?? r.Revenue }}</td>
          <td><span :class="badgeClass(r.yoyPercent ?? r.YoyPercent)">{{ round2(r.yoyPercent ?? r.YoyPercent) }}</span></td>
        </tr>
      </tbody>
    </table>
    <div v-else>無資料</div>
  </div>
</template>