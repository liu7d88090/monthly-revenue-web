<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { searchRevenues, upsertRevenue } from '../api/revenueApi'
import RevenueTable from './RevenueTable.vue'
import type { InsertForm, RevenueUpsertRequest } from '../types/revenue'
import './RevenueSearch.css'

const companyCode = ref<string>('')
const fromYM = ref<string>('')
const toYM = ref<string>('')

const loading = ref(false)
const error = ref('')

const rows = ref<any[]>([])

const pageIndex = ref<number>(1)
const pageSize  = ref<number>(100)
const totalCount = ref<number>(0)
const pageSizeOptions = [20, 50, 100, 200, 500]
const totalPages = computed(() =>
  Math.max(1, Math.ceil((totalCount.value || 0) / pageSize.value))
)

// 強型別表單（全部字串，提交時轉型）
const form = ref<InsertForm>({
  reportDate: '',
  dataYearMonth: '',
  companyCode: '',
  companyName: '',
  industry: '',
  rev_CurrentMonth: '',
  rev_PreviousMonth: '',
  rev_SameMonthLastYear: '',
  moM_ChangePct: '',
  yoY_ChangePct: '',
  rev_Accu_CurrentYear: '',
  rev_Accu_LastYear: '',
  accu_YoY_ChangePct: '',
  notes: ''
})

const submitting = ref(false)

// Dialog
const showDialog = ref(false)
const dialogMsg = ref('')
function openDialog(msg: string) { dialogMsg.value = msg; showDialog.value = true }

// 工具：轉為 number 或 undefined；字串裁切
const num = (s: string) => s.trim() === '' ? undefined : Number(s)
const str = (s: string) => {
  const t = s.trim()
  return t === '' ? undefined : t
}

async function query() {
  error.value = ''
  loading.value = true
  try {
    const res = await searchRevenues({
      companyCode: companyCode.value || undefined,
      fromYM: fromYM.value || undefined,
      toYM: toYM.value || undefined,
      pageIndex: pageIndex.value,
      pageSize: pageSize.value
    })
    rows.value = res.items ?? []
    totalCount.value = res.totalCount ?? rows.value.length
    pageIndex.value = res.pageIndex ?? pageIndex.value
    pageSize.value  = res.pageSize  ?? pageSize.value
  } catch (e: any) {
    error.value = e.message || String(e)
    rows.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

function resetToFirstAndQuery() { pageIndex.value = 1; query() }

let debounce: number | undefined
watch([companyCode, fromYM, toYM], () => {
  if (debounce) clearTimeout(debounce)
  debounce = window.setTimeout(() => resetToFirstAndQuery(), 300)
})
watch(pageSize, () => resetToFirstAndQuery())

function nextPage() { if (pageIndex.value < totalPages.value) { pageIndex.value++; query() } }
function prevPage() { if (pageIndex.value > 1) { pageIndex.value--; query() } }

function buildPayload(f: InsertForm): RevenueUpsertRequest | null {
  const code = f.companyCode.trim()
  const ym = f.dataYearMonth.trim()

  if (!/^\d+$/.test(code))  { openDialog('公司代號需為數字'); return null }
  if (!/^\d{5}$/.test(ym))  { openDialog('資料年月需為 YYYMM'); return null }

  const payload: RevenueUpsertRequest = {
    ReportDate: num(f.reportDate),
    DataYearMonth: num(f.dataYearMonth) ?? 0,
    CompanyCode: num(code) ?? 0,
    CompanyName: str(f.companyName),
    Industry: str(f.industry),
    Rev_CurrentMonth: num(f.rev_CurrentMonth),
    Rev_PreviousMonth: num(f.rev_PreviousMonth),
    Rev_SameMonthLastYear: num(f.rev_SameMonthLastYear),
    MoM_ChangePct: num(f.moM_ChangePct),
    YoY_ChangePct: num(f.yoY_ChangePct),
    Rev_Accu_CurrentYear: num(f.rev_Accu_CurrentYear),
    Rev_Accu_LastYear: num(f.rev_Accu_LastYear),
    Accu_YoY_ChangePct: num(f.accu_YoY_ChangePct),
    Notes: str(f.notes)
  }
  return payload
}

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const payload = buildPayload(form.value)
    if (!payload) return

    const resp = await upsertRevenue(payload);
    const affected = typeof resp === 'number' ? resp : (resp?.affected ?? undefined);
    if (affected === 1) openDialog('新增成功');
    else if (affected === 0) openDialog('資料已存在（未異動）');
    await query()

    form.value = {
      ...form.value,
      dataYearMonth: '',
      rev_CurrentMonth: '',
      yoY_ChangePct: '',
      notes: ''
    }
  } catch (e: any) {
    error.value = e.message || String(e)
  } finally {
    submitting.value = false
  }
}

onMounted(() => { query() })
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="title-wrap">
        <h1>Monthly Revenue 查詢 / 新增</h1>
      </div>
    </header>

    <section class="card">
      <div class="grid">
        <div class="field">
          <label>公司代號</label>
          <input v-model="companyCode" inputmode="numeric" placeholder="數字（可留空 = 全部）" />
        </div>
        <div class="field">
          <label>起始年月</label>
          <input v-model="fromYM" inputmode="numeric" pattern="\d{5}" placeholder="YYYMM（可留空）" />
        </div>
        <div class="field">
          <label>結束年月</label>
          <input v-model="toYM" inputmode="numeric" pattern="\d{5}" placeholder="YYYMM（可留空）" />
        </div>
        <div class="field align-end">
          <button class="btn" :disabled="loading" @click="query">
            <span v-if="!loading">查詢</span><span v-else>查詢中…</span>
          </button>
        </div>
      </div>
      <p v-if="error" class="alert error">錯誤：{{ error }}</p>
    </section>

    <section v-if="loading" class="card">
      <div class="skeleton-table"><div class="skeleton-row" v-for="i in 6" :key="i"></div></div>
    </section>
    <section v-else-if="rows.length === 0" class="card empty"><p>無資料。請調整條件後重試。</p></section>

    <RevenueTable v-else :rows="rows" />

    <section class="card pager" v-if="totalCount > 0">
      <div class="row gap">
        <button class="btn ghost" :disabled="pageIndex<=1" @click="prevPage">上一頁</button>
        <div>第 <strong>{{ pageIndex }}</strong> / {{ totalPages }} 頁</div>
        <button class="btn ghost" :disabled="pageIndex>=totalPages" @click="nextPage">下一頁</button>
      </div>
      <div class="row gap">
        <label>每頁</label>
        <select v-model.number="pageSize">
          <option v-for="n in pageSizeOptions" :key="n" :value="n">{{ n }}</option>
        </select>
        <div class="hint">共 {{ totalCount }} 筆</div>
      </div>
    </section>

    <section class="card">
      <h2>新增</h2>
      <div class="grid">
        <div class="field"><label>出表日期</label><input v-model="form.reportDate" inputmode="numeric" placeholder="數字（可空）" /></div>
        <div class="field"><label>資料年月</label><input v-model="form.dataYearMonth" inputmode="numeric" pattern="\d{5}" placeholder="YYYMM(必填)" /></div>
        <div class="field"><label>公司代號</label><input v-model="form.companyCode" inputmode="numeric" placeholder="數字(必填)" /></div>
        <div class="field"><label>公司名稱</label><input v-model="form.companyName" placeholder="公司名稱" /></div>

        <div class="field"><label>產業別</label><input v-model="form.industry" placeholder="產業別" /></div>
        <div class="field"><label>當月營收</label><input v-model="form.rev_CurrentMonth" inputmode="numeric" placeholder="請輸入數字" /></div>
        <div class="field"><label>上月營收</label><input v-model="form.rev_PreviousMonth" inputmode="numeric" placeholder="請輸入數字" /></div>
        <div class="field"><label>去年當月營收</label><input v-model="form.rev_SameMonthLastYear" inputmode="numeric" placeholder="請輸入數字" /></div>

        <div class="field"><label>上月比較增減(%)</label><input v-model="form.moM_ChangePct" inputmode="decimal" placeholder="請輸入數字" /></div>
        <div class="field"><label>去年同月增減(%)</label><input v-model="form.yoY_ChangePct" inputmode="decimal" placeholder="請輸入數字" /></div>
        <div class="field"><label>當月累計營收</label><input v-model="form.rev_Accu_CurrentYear" inputmode="numeric" placeholder="請輸入數字" /></div>
        <div class="field"><label>去年累計營收</label><input v-model="form.rev_Accu_LastYear" inputmode="numeric" placeholder="請輸入數字" /></div>

        <div class="field"><label>累計前期比較增減(%)</label><input v-model="form.accu_YoY_ChangePct" inputmode="decimal" placeholder="請輸入數字" /></div>
        <div class="field" style="grid-column: span 12;"><label>備註</label><input v-model="form.notes" placeholder="備註" /></div>
      </div>

      <div class="row gap" style="margin-top: 8px;">
        <button class="btn" :disabled="submitting" @click="submit">送出</button>
        <button class="btn ghost" :disabled="submitting" @click="form = {
          reportDate: '', dataYearMonth: '', companyCode: '', companyName: '', industry: '',
          rev_CurrentMonth: '', rev_PreviousMonth: '', rev_SameMonthLastYear: '',
          moM_ChangePct: '', yoY_ChangePct: '', rev_Accu_CurrentYear: '', rev_Accu_LastYear: '',
          accu_YoY_ChangePct: '', notes: ''
        }">清空</button>
      </div>
    </section>

    <div v-if="showDialog" class="modal-backdrop" @click.self="showDialog=false">
      <div class="modal" role="alertdialog" aria-modal="true">
        <h3 class="modal-title">提示</h3>
        <p class="modal-body">{{ dialogMsg }}</p>
        <div class="row gap" style="justify-content: flex-end; margin-top: 12px;">
          <button class="btn" @click="showDialog=false">確定</button>
        </div>
      </div>
    </div>
  </div>
</template>
