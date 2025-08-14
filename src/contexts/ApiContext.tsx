import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { ReactNode } from 'react'

// API 錯誤介面
export interface ApiError {
  message: string
  statusCode?: number
  code?: string
  details?: unknown
}

// API 狀態介面
interface ApiState {
  loading: Record<string, boolean>
  errors: Record<string, ApiError | null>
  data: Record<string, unknown>
}

// API Actions
type ApiAction =
  | { type: 'SET_LOADING'; key: string; loading: boolean }
  | { type: 'SET_ERROR'; key: string; error: ApiError | null }
  | { type: 'SET_DATA'; key: string; data: unknown }
  | { type: 'CLEAR_ERROR'; key: string }
  | { type: 'CLEAR_ALL_ERRORS' }

// 初始狀態
const initialState: ApiState = {
  loading: {},
  errors: {},
  data: {}
}

// Reducer
const apiReducer = (state: ApiState, action: ApiAction): ApiState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.key]: action.loading }
      }
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.key]: action.error }
      }
    case 'SET_DATA':
      return {
        ...state,
        data: { ...state.data, [action.key]: action.data }
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.key]: null }
      }
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {}
      }
    default:
      return state
  }
}

// Context 類型定義
interface ApiContextType extends ApiState {
  makeRequest: <T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: { skipLoading?: boolean; skipCache?: boolean }
  ) => Promise<T>
  clearError: (key: string) => void
  clearAllErrors: () => void
  isLoading: (key: string) => boolean
  getError: (key: string) => ApiError | null
  getData: <T>(key: string) => T | null
}

// 創建 Context
const ApiContext = createContext<ApiContextType | undefined>(undefined)

// Provider 組件
export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(apiReducer, initialState)

  // 發送 API 請求的核心函數
  const makeRequest = useCallback(async <T,>(
    key: string,
    requestFn: () => Promise<T>,
    options?: { skipLoading?: boolean; skipCache?: boolean }
  ): Promise<T> => {
    try {
      // 設置加載狀態
      if (!options?.skipLoading) {
        dispatch({ type: 'SET_LOADING', key, loading: true })
      }
      
      // 清除之前的錯誤
      dispatch({ type: 'SET_ERROR', key, error: null })

      // 如果不跳過快取，先檢查是否有快取數據
      if (!options?.skipCache && state.data[key]) {
        // 可以在這裡添加快取時間檢查邏輯
      }

      // 執行請求
      const result = await requestFn()
      
      // 存儲數據
      dispatch({ type: 'SET_DATA', key, data: result })
      
      return result
    } catch (error) {
      // 處理錯誤
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : '未知錯誤',
        code: 'REQUEST_ERROR'
      }
      
      dispatch({ type: 'SET_ERROR', key, error: apiError })
      throw apiError
    } finally {
      // 清除加載狀態
      if (!options?.skipLoading) {
        dispatch({ type: 'SET_LOADING', key, loading: false })
      }
    }
  }, [state.data])

  // 清除單個錯誤
  const clearError = useCallback((key: string) => {
    dispatch({ type: 'CLEAR_ERROR', key })
  }, [])

  // 清除所有錯誤
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' })
  }, [])

  // 檢查是否正在加載
  const isLoading = useCallback((key: string): boolean => {
    return state.loading[key] || false
  }, [state.loading])

  // 獲取錯誤
  const getError = useCallback((key: string): ApiError | null => {
    return state.errors[key] || null
  }, [state.errors])

  // 獲取數據
  const getData = useCallback(<T,>(key: string): T | null => {
    return (state.data[key] as T) || null
  }, [state.data])

  const contextValue: ApiContextType = {
    ...state,
    makeRequest,
    clearError,
    clearAllErrors,
    isLoading,
    getError,
    getData
  }

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApiState = (key: string) => {
  const { isLoading, getError, getData } = useApi()
  
  return {
    loading: isLoading(key),
    error: getError(key),
    data: getData(key)
  }
}