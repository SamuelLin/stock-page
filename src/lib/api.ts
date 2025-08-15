import type { Stock } from "@/types/stock"

// API 配置
const API_CONFIG = {
  // CORS 代理列表（備用方案）
  CORS_PROXIES: [
    'https://api.allorigins.win/get?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest='
  ],
  TWSE_BASE_URL: 'https://openapi.twse.com.tw/v1',
  ENDPOINTS: {
    STOCK_DAY_ALL: '/exchangeReport/STOCK_DAY_ALL'
  },
  TIMEOUT: 15000, // 15 秒超時（代理服務較慢）
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 2000 // 2 秒重試延遲
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
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
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

// 股票數據 API 服務
export const stockApi = {
  /**
   * 獲取所有股票當日交易資料
   */
  async getAllStocks(): Promise<Stock[]> {
    if (!checkNetworkStatus()) {
      throw new ApiError('無網路連線，請檢查網路設定', 0, 'NO_NETWORK')
    }

    const targetUrl = `${API_CONFIG.TWSE_BASE_URL}${API_CONFIG.ENDPOINTS.STOCK_DAY_ALL}`
    
    // 嘗試使用不同的 CORS 代理
    for (let i = 0; i < API_CONFIG.CORS_PROXIES.length; i++) {
      try {
        const proxy = API_CONFIG.CORS_PROXIES[i]
        let proxyUrl: string
        
        if (proxy.includes('allorigins.win')) {
          proxyUrl = `${proxy}${encodeURIComponent(targetUrl)}`
        } else {
          proxyUrl = `${proxy}${targetUrl}`
        }
        
        console.log(`嘗試代理 ${i + 1}:`, proxy.split('//')[1].split('/')[0])
        
        const response = await fetchWithRetry(proxyUrl)
        let data: any
        
        if (proxy.includes('allorigins.win')) {
          const proxyData = await response.json()
          if (!proxyData.contents) {
            throw new Error('代理返回格式錯誤')
          }
          data = JSON.parse(proxyData.contents)
        } else {
          data = await response.json()
        }

        // 驗證數據格式
        if (!Array.isArray(data)) {
          throw new Error('數據格式不正確')
        }

        console.log(`✅ 代理 ${i + 1} 成功，獲取 ${data.length} 筆資料`)
        return data as Stock[]
        
      } catch (error) {
        console.log(`❌ 代理 ${i + 1} 失敗:`, error instanceof Error ? error.message : error)
        
        // 如果是最後一個代理也失敗了
        if (i === API_CONFIG.CORS_PROXIES.length - 1) {
          throw new ApiError('所有代理服務都無法使用，請稍後再試', 0, 'ALL_PROXIES_FAILED')
        }
      }
    }

    throw new ApiError('獲取股票資料失敗', 0, 'FETCH_ERROR')
  },

  /**
   * 根據股票代號搜尋股票
   */
  async searchStocksByCode(codes: string[]): Promise<Stock[]> {
    const allStocks = await this.getAllStocks()
    return allStocks.filter(stock => 
      codes.some(code => stock.Code.includes(code))
    )
  },

  /**
   * 根據股票名稱搜尋股票
   */
  async searchStocksByName(names: string[]): Promise<Stock[]> {
    const allStocks = await this.getAllStocks()
    return allStocks.filter(stock =>
      names.some(name => stock.Name.includes(name))
    )
  }
}

// API 狀態類型
export type ApiState<T> = {
  data: T | null
  loading: boolean
  error: ApiError | null
  lastUpdated: Date | null
}

// 創建初始 API 狀態
export const createInitialApiState = <T>(): ApiState<T> => ({
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
})
