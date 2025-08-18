// 統一的股票型別 - 簡化為單一介面
export interface Stock {
  date: string
  code: string
  name: string
  closingPrice: string
  change: string
  openingPrice: string
  highestPrice: string
  lowestPrice: string
  tradeVolume: string
  tradeValue: string
  transaction: string
  source: 'twse' | 'tpex'
}

// API 回應型別 - 只用於內部處理
export interface TwseApiResponse {
  Date: string
  Code: string
  Name: string
  TradeVolume: string
  TradeValue: string
  OpeningPrice: string
  HighestPrice: string
  LowestPrice: string
  ClosingPrice: string
  Change: string
  Transaction: string
}

export interface TpexApiResponse {
  Date: string
  SecuritiesCompanyCode: string
  CompanyName: string
  Close: string
  Change: string
  Open: string
  High: string
  Low: string
  TradingShares: string
  TransactionAmount: string
  TransactionNumber: string
}