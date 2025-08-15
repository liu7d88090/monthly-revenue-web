const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || ''

export async function getRevenues(companyCode, params = {}) {
  if (!companyCode) throw new Error('companyCode 為必填')
  const q = new URLSearchParams()
  if (params.fromYM) q.set('fromYM', params.fromYM)
  if (params.toYM) q.set('toYM', params.toYM)
  const url = `${BASE}/api/revenues/${encodeURIComponent(companyCode)}${q.toString() ? `?${q}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET 失敗: ${res.status}`)
  return await res.json()
}

export async function upsertRevenue(payload) {
  const url = `${BASE}/api/revenues`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`POST 失敗: ${res.status}`)
  return true
}