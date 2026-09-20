import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tool } from '../types.ts';

export interface CompareToolItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  tagline?: string;
  pricing_type?: string;
  rating?: number;
  arabic_support?: boolean | string;
}

interface CompareContextType {
  compareItems: CompareToolItem[];
  addToCompare: (tool: CompareToolItem | Tool) => boolean;
  removeFromCompare: (slugOrId: string) => void;
  isInCompare: (slugOrId: string) => boolean;
  clearCompare: () => void;
  isDockOpen: boolean;
  setIsDockOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = 'daleel_compare_items';

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<CompareToolItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDockOpen, setIsDockOpen] = useState<boolean>(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
    } catch (e) {
      console.warn('Could not save compare items to localStorage', e);
    }
  }, [compareItems]);

  const isInCompare = (slugOrId: string) => {
    return compareItems.some((item) => item.slug === slugOrId || item.id === slugOrId);
  };

  const addToCompare = (tool: CompareToolItem | Tool): boolean => {
    if (isInCompare(tool.slug || tool.id)) {
      removeFromCompare(tool.slug || tool.id);
      return false; // Removed
    }

    if (compareItems.length >= 3) {
      // Max 3 tools for side-by-side comparison
      alert('يمكنك مقارنة حتى 3 أدوات كحد أقصى في وقت واحد. يرجى إزالة أداة لإضافة أخرى.');
      return false;
    }

    const newItem: CompareToolItem = {
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      logo_url: tool.logo_url || '',
      tagline: tool.tagline || '',
      pricing_type: tool.pricing_type || '',
      rating: tool.rating || 4.8,
      arabic_support: (tool as any).arabic_support || false,
    };

    setCompareItems((prev) => [...prev, newItem]);
    setIsDockOpen(true);
    return true; // Added
  };

  const removeFromCompare = (slugOrId: string) => {
    setCompareItems((prev) => prev.filter((item) => item.slug !== slugOrId && item.id !== slugOrId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        isDockOpen,
        setIsDockOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
