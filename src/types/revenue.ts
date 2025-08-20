export interface RevenueUpsertRequest {
  ReportDate?: number;
  DataYearMonth: number;         // YYYMM，必填
  CompanyCode: number;           // 4 碼字串，必填
  CompanyName?: string;
  Industry?: string;
  Rev_CurrentMonth?: number;
  Rev_PreviousMonth?: number;
  Rev_SameMonthLastYear?: number;
  MoM_ChangePct?: number;
  YoY_ChangePct?: number;
  Rev_Accu_CurrentYear?: number;
  Rev_Accu_LastYear?: number;
  Accu_YoY_ChangePct?: number;
  Notes?: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

export interface SearchParams {
  companyCode?: string;
  fromYM?: string;
  toYM?: string;
  pageIndex?: number;
  pageSize?: number;
}

/** 表單使用：全部用字串儲存，提交時再轉型 */
export interface InsertForm {
  reportDate: string;
  dataYearMonth: string;
  companyCode: string;
  companyName: string;
  industry: string;
  rev_CurrentMonth: string;
  rev_PreviousMonth: string;
  rev_SameMonthLastYear: string;
  moM_ChangePct: string;
  yoY_ChangePct: string;
  rev_Accu_CurrentYear: string;
  rev_Accu_LastYear: string;
  accu_YoY_ChangePct: string;
  notes: string;
}
