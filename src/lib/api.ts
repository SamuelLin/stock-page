import type { Stock, TwseApiResponse, TpexApiResponse } from "@/types/stock"

// API 配置
const API_CONFIG = {
  TWSE: {
    BASE_URL: '/api/twse',
    ENDPOINTS: {
      STOCK_DAY_ALL: '/exchangeReport/STOCK_DAY_ALL'
    }
  },
  TPEX: {
    BASE_URL: '/api/tpex',
    ENDPOINTS: {
      MAINBOARD_DAILY: '/tpex_mainboard_daily_close_quotes'
    }
  },
  TIMEOUT: 10000, // 10 秒超時
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 秒重試延遲
} as const

// API 錯誤類型
export class ApiError extends Error {
  public status?: number
  public code?: string
  
  constructor(
    message: string,
    status?: number,
    code?: string
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// 網絡狀況檢查
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine
}

// 通用 fetch 包裝器，包含重試機制
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new ApiError(
        `HTTP Error: ${response.status} ${response.statusText}`,
        response.status
      )
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    // 如果是取消錯誤（超時）
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('請求超時，請檢查網路連線', 408, 'TIMEOUT')
    }

    // 如果是網路錯誤且還有重試次數
    if (retries > 0 && (!navigator.onLine || error instanceof TypeError)) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY))
      return fetchWithRetry(url, options, retries - 1)
    }

    // 如果是 ApiError 就直接拋出
    if (error instanceof ApiError) {
      throw error
    }

    // 其他錯誤
    throw new ApiError(
      error instanceof Error ? error.message : '未知錯誤',
      0,
      'UNKNOWN'
    )
  }
}

// 簡化的數據轉換函數
const transformTwseStock = (stock: TwseApiResponse): Stock => ({
  date: stock.Date,
  code: stock.Code,
  name: stock.Name,
  closingPrice: stock.ClosingPrice,
  change: stock.Change,
  openingPrice: stock.OpeningPrice,
  highestPrice: stock.HighestPrice,
  lowestPrice: stock.LowestPrice,
  tradeVolume: stock.TradeVolume,
  tradeValue: stock.TradeValue,
  transaction: stock.Transaction,
  source: 'twse'
})

const transformTpexStock = (stock: TpexApiResponse): Stock => ({
  date: stock.Date,
  code: stock.SecuritiesCompanyCode,
  name: stock.CompanyName,
  closingPrice: stock.Close,
  change: stock.Change,
  openingPrice: stock.Open,
  highestPrice: stock.High,
  lowestPrice: stock.Low,
  tradeVolume: stock.TradingShares,
  tradeValue: stock.TransactionAmount,
  transaction: stock.TransactionNumber,
  source: 'tpex'
})

// 簡化的股票數據 API 服務
export const stockApi = {
  /**
   * 獲取所有股票資料（合併上市和上櫃）
   */
  async getAllStocks(): Promise<Stock[]> {
    if (!checkNetworkStatus()) {
      throw new ApiError('無網路連線，請檢查網路設定', 0, 'NO_NETWORK')
    }

    try {
      // 並行獲取上市和上櫃股票數據
      const [twseResult, tpexResult] = await Promise.allSettled([
        this.fetchTwseStocks(),
        this.fetchTpexStocks()
      ])

      const stocks: Stock[] = []

      // 處理上市股票數據
      if (twseResult.status === 'fulfilled') {
        stocks.push(...twseResult.value)
      }

      // 處理上櫃股票數據
      if (tpexResult.status === 'fulfilled') {
        stocks.push(...tpexResult.value)
      }

      // 如果兩個 API 都失敗，拋出錯誤
      if (twseResult.status === 'rejected' && tpexResult.status === 'rejected') {
        throw new ApiError('無法獲取任何股票資料', 0, 'ALL_APIS_FAILED')
      }

      return stocks
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('獲取股票資料失敗', 0, 'FETCH_ERROR')
    }
  },

  // 私有方法：獲取上市股票
  async fetchTwseStocks(): Promise<Stock[]> {
    const url = `${API_CONFIG.TWSE.BASE_URL}${API_CONFIG.TWSE.ENDPOINTS.STOCK_DAY_ALL}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new ApiError('上市股票 API 數據格式錯誤', 0, 'INVALID_DATA')
    }

    return data.map(transformTwseStock)
  },

  // 私有方法：獲取上櫃股票
  async fetchTpexStocks(): Promise<Stock[]> {
    const url = `${API_CONFIG.TPEX.BASE_URL}${API_CONFIG.TPEX.ENDPOINTS.MAINBOARD_DAILY}`
    const response = await fetchWithRetry(url)
    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new ApiError('上櫃股票 API 數據格式錯誤', 0, 'INVALID_DATA')
    }

    return data.map(transformTpexStock)
  }
}

//
