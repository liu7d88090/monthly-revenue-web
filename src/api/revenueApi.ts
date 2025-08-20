import type { PagedResponse, SearchParams, RevenueUpsertRequest } from '../types/revenue';

const BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

let lastCtrl: AbortController | null = null;
async function api<T>(path: string, options: RequestInit): Promise<T> {
  if (options.signal == null) {
    if (lastCtrl) lastCtrl.abort();
    lastCtrl = new AbortController();
    options.signal = lastCtrl.signal;
  }
  const url = `${BASE}${path}`;
  const res = await fetch(url, options);
  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`${options?.method || 'GET'} ${url} -> ${res.status} ${text}`);
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function searchRevenues(params: SearchParams = {}): Promise<PagedResponse<any>> {
  const body: SearchParams = {
    companyCode: params.companyCode ?? undefined,
    fromYM: params.fromYM ?? undefined,
    toYM: params.toYM ?? undefined,
    pageIndex: params.pageIndex ?? 1,
    pageSize: params.pageSize ?? 100,
  };
  return api<PagedResponse<any>>('/api/revenues/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function upsertRevenue(payload: RevenueUpsertRequest): Promise<{ affected?: number } | number> {
  const json = JSON.stringify(payload, (_k, v) => (v === undefined ? undefined : v));
  return api('/api/revenues/upsert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
  });
}
