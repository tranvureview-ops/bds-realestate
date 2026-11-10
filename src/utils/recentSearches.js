'use client';

import { useState, useEffect, useCallback } from 'react';

export const DEFAULT_RECENT_SEARCHES = [
  {
    id: 'rec-default-1',
    title: 'Mua bán BĐS tại Hà Nội',
    subtitle: 'Hà Nội · Toàn bộ khu vực',
    url: '/nha-dat-ban-ha-noi',
    filters: { demand: 'sale', city: 'Hà Nội' },
    keyword: ''
  },
  {
    id: 'rec-default-2',
    title: 'Mua bán BĐS tại Khu đô thị Nam Hòa Xuân',
    subtitle: 'Đà Nẵng · Khu đô thị Nam Hòa Xuân',
    url: '/nha-dat-ban-da-nang?q=Khu+đô+thị+Nam+Hòa+Xuân',
    filters: { demand: 'sale', city: 'Đà Nẵng', keyword: 'Khu đô thị Nam Hòa Xuân' },
    keyword: 'Khu đô thị Nam Hòa Xuân'
  },
  {
    id: 'rec-default-3',
    title: 'Mua bán BĐS tại The Gloria by Silk Path',
    subtitle: 'Hà Nội · The Gloria by Silk Path',
    url: '/nha-dat-ban-ha-noi?q=The+Gloria+by+Silk+Path',
    filters: { demand: 'sale', city: 'Hà Nội', keyword: 'The Gloria by Silk Path' },
    keyword: 'The Gloria by Silk Path'
  }
];

const STORAGE_KEY = 'bds_recent_searches';
const CLEARED_KEY = 'bds_recent_searches_cleared';

export const getRecentSearches = () => {
  if (typeof window === 'undefined') return [];
  try {
    const isCleared = localStorage.getItem(CLEARED_KEY) === 'true';
    if (isCleared) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    return DEFAULT_RECENT_SEARCHES;
  } catch {
    return [];
  }
};

export const saveRecentSearch = (newItem) => {
  if (typeof window === 'undefined' || !newItem || !newItem.title) return [];
  try {
    const current = getRecentSearches();
    const cleanTitle = newItem.title.trim();
    if (!cleanTitle) return current;

    const filtered = current.filter(
      item => item.title && item.title.trim().toLowerCase() !== cleanTitle.toLowerCase()
    );

    const updated = [
      {
        id: 'rec-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        ...newItem,
        title: cleanTitle
      },
      ...filtered
    ].slice(0, 6);

    localStorage.removeItem(CLEARED_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('bds_recent_searches_updated'));
    return updated;
  } catch {
    return [];
  }
};

export const removeRecentSearch = (id) => {
  if (typeof window === 'undefined') return [];
  try {
    const current = getRecentSearches();
    const updated = current.filter(item => item.id !== id);
    if (updated.length === 0) {
      localStorage.setItem(CLEARED_KEY, 'true');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('bds_recent_searches_updated'));
    return updated;
  } catch {
    return [];
  }
};

export const clearAllRecentSearches = () => {
  if (typeof window === 'undefined') return [];
  try {
    localStorage.setItem(CLEARED_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('bds_recent_searches_updated'));
    return [];
  } catch {
    return [];
  }
};

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setRecentSearches(getRecentSearches());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    const handleUpdate = () => refresh();
    window.addEventListener('bds_recent_searches_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('bds_recent_searches_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refresh]);

  const addSearch = useCallback((item) => {
    const updated = saveRecentSearch(item);
    setRecentSearches(updated);
    return updated;
  }, []);

  const removeSearch = useCallback((id, e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const updated = removeRecentSearch(id);
    setRecentSearches(updated);
    return updated;
  }, []);

  const clearSearches = useCallback((e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const updated = clearAllRecentSearches();
    setRecentSearches(updated);
    return updated;
  }, []);

  return {
    recentSearches,
    isLoaded,
    addSearch,
    removeSearch,
    clearSearches
  };
}
