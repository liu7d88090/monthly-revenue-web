<script setup>
import { ref, watch, onMounted } from 'vue'
import { getRevenues, upsertRevenue } from '../api/revenueApi'
const companyCode = ref('2330')
const fromYM = ref('')
const toYM = ref('')
const loading = ref(false)
const error = ref('')
const rows = ref([])
const form = ref({ companyCode: '', yearMonth: '', revenue: '', yoyPercent: '' })
const submitting = ref(false)

async function query() {
  error.value = ''
  loading.value = true
  try {
    rows.value = await getRevenues(companyCode.value, {
      fromYM: fromYM.value || undefined,
      toYM: toYM.value || undefined
    })
  } catch (e) {
    error.value = e.message || String(e)
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    if (!form.value.companyCode || !/^\d{4}$/.test(form.value.companyCode)) {
      throw new Error('companyCode 必填且需為4碼數字')
    }
    if (!/^\d{6}$/.test(form.value.yearMonth)) {
      throw new Error('yearMonth 需為 YYYYMM')
    }
    const payload = {
      companyCode: form.value.companyCode,
      yearMonth: form.value.yearMonth,
      revenue: Number(form.value.revenue ?? 0),
      yoyPercent: form.value.yoyPercent === '' ? null : Number(form.value.yoyPercent)
    }
    await upsertRevenue(payload)
    if (!companyCode.value) companyCode.value = payload.companyCode
    await query()
    form.value = { companyCode: payload.companyCode, yearMonth: '', revenue: '', yoyPercent: '' }
  } catch (e) {
    error.value = e.message || String(e)
  } finally {
    submitting.value = false
  }
}

let watchTimer
watch([companyCode, fromYM, toYM], () => {
  if (watchTimer) clearTimeout(watchTimer)
  watchTimer = setTimeout(() => {
    if (companyCode.value) query()
  }, 300)
})

onMounted(() => {
  if (companyCode.value) query()
})
</script>

<template>
  <div class="card">
    <h1>Monthly Revenue 查詢 / 新增</h1>
    <div class="grid" style="margin-bottom: 12px;">
      <div>
        <label>公司代號</label>
        <input v-model="companyCode" />
      </div>
      <div>
        <label>起始年月</label>
        <input v-model="fromYM" />
      </div>
      <div>
        <label>結束年月</label>
        <input v-model="toYM" />
      </div>
      <div style="align-self: end;">
        <button :disabled="loading" @click="query">查詢</button>
      </div>
    </div>
    <p v-if="error">{{ error }}</p>
    <p v-if="loading">查詢中…</p>
    <RevenueTable :rows="rows" />
    <div class="card" style="margin-top: 16px;">
      <h1>新增 / 更新</h1>
      <div class="grid">
        <div>
          <label>公司代號</label>
          <input v-model="form.companyCode" />
        </div>
        <div>
          <label>年月</label>
          <input v-model="form.yearMonth" />
        </div>
        <div>
          <label>營業收入</label>
          <input v-model="form.revenue" />
        </div>
        <div>
          <label>去年同月增減(%)</label>
          <input v-model="form.yoyPercent" />
        </div>
      </div>
      <div class="flex" style="margin-top: 12px;">
        <button :disabled="submitting" @click="submit">送出</button>
        <button class="secondary" :disabled="submitting" @click="form = { companyCode: '', yearMonth: '', revenue: '', yoyPercent: '' }">清空</button>
      </div>
    </div>
  </div>
</template>