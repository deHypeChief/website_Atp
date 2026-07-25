/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { getProducts, getSettings } from '../lib/api'
import { DEFAULT_SETTINGS } from '../lib/config'

const STORE_DATA_FALLBACK = {
  products: [],
  settings: DEFAULT_SETTINGS,
  loading: true,
  error: '',
  reload: () => {},
}

const StoreDataContext = createContext(STORE_DATA_FALLBACK)

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [nextProducts, nextSettings] = await Promise.all([getProducts(), getSettings()])
      setProducts(nextProducts); setSettings(nextSettings)
    } catch (requestError) { setError(requestError.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    Promise.all([getProducts(), getSettings()]).then(([nextProducts, nextSettings]) => {
      if (!active) return
      setProducts(nextProducts); setSettings(nextSettings)
    }).catch(requestError => { if (active) setError(requestError.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return <StoreDataContext.Provider value={{ products, settings, loading, error, reload: load }}>{children}</StoreDataContext.Provider>
}

export const useStoreData = () => useContext(StoreDataContext) || STORE_DATA_FALLBACK
