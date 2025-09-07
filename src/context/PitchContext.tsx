
'use client';

import type { Pitch, Category } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface LiveState {
  isLive: boolean;
  currentPitchId: string | null;
  isWinnerShowcaseLive: boolean;
  showcasedCategoryId: string | null;
}

interface PitchContextType {
  pitches: Pitch[];
  categories: string[];
  isLiveMode: boolean;
  currentPitchId: string | null;
  loading: boolean;
  initialLoadComplete: boolean;
  isWinnerShowcaseLive: boolean;
  showcasedCategoryId: string | null;
  showcasedPitch: Pitch | null;
  addPitch: (pitch: Omit<Pitch, '_id' | 'rating' | 'visible' | 'ratings'>) => Promise<void>;
  removePitch: (pitchId: string) => Promise<void>;
  togglePitchVisibility: (pitchId: string, isVisible: boolean) => Promise<void>;
  updatePitchRating: (pitchId: string, newRating: number) => Promise<void>;
  getWinnerForCategory: (category: string) => Pitch | null;
  addCategory: (category: string) => Promise<void>;
  removeCategory: (category: string) => Promise<void>;
  startLiveMode: () => void;
  endLiveMode: () => void;
  goToNextPitch: () => void;
  goToPreviousPitch: () => void;
  startWinnerShowcase: (categoryId: string) => void;
  endWinnerShowcase: () => void;
  resetAllRatings: () => Promise<void>;
}

export const PitchContext = createContext<PitchContextType>({
  pitches: [],
  categories: [],
  isLiveMode: false,
  currentPitchId: null,
  loading: true,
  initialLoadComplete: false,
  isWinnerShowcaseLive: false,
  showcasedCategoryId: null,
  showcasedPitch: null,
  addPitch: async () => {},
  removePitch: async () => {},
  togglePitchVisibility: async () => {},
  updatePitchRating: async () => {},
  getWinnerForCategory: () => null,
  addCategory: async () => {},
  removeCategory: async () => {},
  startLiveMode: () => {},
  endLiveMode: () => {},
  goToNextPitch: () => {},
  goToPreviousPitch: () => {},
  startWinnerShowcase: () => {},
  endWinnerShowcase: () => {},
  resetAllRatings: async () => {},
});

export function PitchProvider({ children }: { children: ReactNode }) {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentPitchId, setCurrentPitchId] = useState<string | null>(null);
  const [isWinnerShowcaseLive, setIsWinnerShowcaseLive] = useState(false);
  const [showcasedCategoryId, setShowcasedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const addCategory = useCallback(async (name: string, shouldFetchData = true) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok && shouldFetchData) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pitchesRes, categoriesRes, liveStateRes] = await Promise.all([
        fetch('/api/pitches'),
        fetch('/api/categories'),
        fetch('/api/livestate'),
      ]);

      if (pitchesRes.ok) {
        const pitchesData = await pitchesRes.json();
        if (pitchesData.success) {
          const pitchesWithAvgRating = pitchesData.data.map((p: Pitch) => ({
            ...p,
            rating: p.ratings && p.ratings.length > 0 ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length : 0,
          }));
          setPitches(pitchesWithAvgRating);
        }
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        if (categoriesData.success) {
          if (categoriesData.data.length === 0) {
            const defaultCategories = ['Web Development', '3D Animation', 'Video Editing', 'VFX'];
            // This is a fire-and-forget, no need to await all
            defaultCategories.forEach(name => addCategory(name, false));
            setCategories(defaultCategories);
          } else {
            setCategories(categoriesData.data.map((c: Category) => c.name));
          }
        }
      }
      
      if(liveStateRes.ok) {
        const liveStateData = await liveStateRes.json();
        if (liveStateData.success && liveStateData.data) {
          setIsLiveMode(liveStateData.data.isLive);
          setCurrentPitchId(liveStateData.data.currentPitchId);
          setIsWinnerShowcaseLive(liveStateData.data.isWinnerShowcaseLive);
          setShowcasedCategoryId(liveStateData.data.showcasedCategoryId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [addCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!initialLoadComplete) return;

    const eventSource = new EventSource('/api/livestate/events');
    
    eventSource.onmessage = (event) => {
      try {
        const data: LiveState = JSON.parse(event.data);
        
        setIsLiveMode(prev => prev !== data.isLive ? data.isLive : prev);
        setCurrentPitchId(prev => prev !== data.currentPitchId ? data.currentPitchId : prev);
        setIsWinnerShowcaseLive(prev => prev !== data.isWinnerShowcaseLive ? data.isWinnerShowcaseLive : prev);
        setShowcasedCategoryId(prev => prev !== data.showcasedCategoryId ? data.showcasedCategoryId : prev);

        const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/presenter') || pathname.startsWith('/login');
        if (data.isWinnerShowcaseLive && !pathname.startsWith('/showcase') && !isAdminPage) {
          router.push('/showcase');
        } else if (!data.isWinnerShowcaseLive && pathname.startsWith('/showcase')) {
          router.push('/');
        }
      } catch (error) {
        console.error("Failed to parse live state event:", error);
      }
    };

    eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [initialLoadComplete, pathname, router]);
  
  const updateLiveState = async (state: Partial<LiveState>) => {
    try {
      const res = await fetch('/api/livestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        throw new Error('Failed to update live state');
      }
    } catch (error) {
      console.error('Failed to update live state:', error);
    }
  };

  const addPitch = async (newPitch: Omit<Pitch, '_id' | 'rating' | 'visible' | 'ratings'>) => {
    try {
      const res = await fetch('/api/pitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPitch, ratings: [], visible: true }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to add pitch:', error);
    }
  };

  const removePitch = async (pitchId: string) => {
    try {
      const res = await fetch(`/api/pitches/${pitchId}`, { method: 'DELETE' });
      if (res.ok) {
        setPitches(prev => prev.filter(p => p._id !== pitchId));
      }
    } catch (error) {
      console.error('Failed to remove pitch:', error);
    }
  };

  const togglePitchVisibility = async (pitchId: string, visible: boolean) => {
    setPitches(prev => prev.map(p => p._id === pitchId ? { ...p, visible } : p));
    try {
      await fetch(`/api/pitches/${pitchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible }),
      });
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      setPitches(prev => prev.map(p => p._id === pitchId ? { ...p, visible: !visible } : p));
    }
  };

  const updatePitchRating = async (pitchId: string, newRating: number) => {
    const pitch = pitches.find(p => p._id === pitchId);
    if (!pitch) return;

    const newRatings = [...pitch.ratings, newRating];
    const newAverage = newRatings.reduce((a, b) => a + b, 0) / newRatings.length;
    
    setPitches(prev => prev.map(p => p._id === pitchId ? { ...p, ratings: newRatings, rating: newAverage } : p));

    try {
      await fetch(`/api/pitches/${pitchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings: newRatings }),
      });
    } catch (error) {
      console.error('Failed to update rating:', error);
      setPitches(prev => prev.map(p => p._id === pitchId ? pitch : p));
    }
  };

  const getWinnerForCategory = (category: string): Pitch | null => {
    const categoryPitches = pitches.filter((p) => p.category === category && p.ratings.length > 0);
    if (categoryPitches.length === 0) return null;
    return categoryPitches.sort((a, b) => b.rating - a.rating)[0];
  };

  const removeCategory = async (name: string) => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      } else {
        const { error } = await res.json();
        alert(`Failed to delete category: ${error}`);
      }
    } catch (error) {
      console.error('Failed to remove category:', error);
    }
  };

  const getSortedPitches = () => {
    const categoryOrder = categories;
    
    const visiblePitches = pitches.filter(p => p.visible);

    return visiblePitches.sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.category);
        const bIndex = categoryOrder.indexOf(b.category);

        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;

        return aIndex - bIndex;
    });
  };

  const startLiveMode = () => {
    const sortedPitches = getSortedPitches();
    const firstPitchId = sortedPitches.length > 0 ? sortedPitches[0]._id : null;
    updateLiveState({ isLive: true, currentPitchId: firstPitchId });
  };
  
  const endLiveMode = () => {
    updateLiveState({ isLive: false, currentPitchId: null });
  };

  const goToNextPitch = () => {
    const sortedPitches = getSortedPitches();
    if (sortedPitches.length === 0) return;

    const currentIndex = sortedPitches.findIndex(p => p._id === currentPitchId);
    if (currentIndex > -1 && currentIndex < sortedPitches.length - 1) {
      updateLiveState({ currentPitchId: sortedPitches[currentIndex + 1]._id });
    }
  };

  const goToPreviousPitch = () => {
    const sortedPitches = getSortedPitches();
    if (sortedPitches.length === 0) return;

    const currentIndex = sortedPitches.findIndex(p => p._id === currentPitchId);
    if (currentIndex > 0) {
      updateLiveState({ currentPitchId: sortedPitches[currentIndex - 1]._id });
    }
  };

  const startWinnerShowcase = (categoryId: string) => {
    updateLiveState({ isWinnerShowcaseLive: true, showcasedCategoryId: categoryId });
  };

  const endWinnerShowcase = () => {
    updateLiveState({ isWinnerShowcaseLive: false, showcasedCategoryId: null });
  };

  const resetAllRatings = async () => {
    try {
      const res = await fetch('/api/pitches/reset', { method: 'POST' });
      if (res.ok) {
        await fetchData();
      } else {
        const { error } = await res.json();
        alert(`Failed to reset ratings: ${error}`);
      }
    } catch (error) {
      console.error('Failed to reset ratings:', error);
    }
  };

  const showcasedPitch = getWinnerForCategory(showcasedCategoryId || '');


  const value = {
    pitches,
    categories,
    isLiveMode,
    currentPitchId,
    loading,
    initialLoadComplete,
    isWinnerShowcaseLive,
    showcasedCategoryId,
    showcasedPitch,
    addPitch,
    removePitch,
    togglePitchVisibility,
    updatePitchRating,
    getWinnerForCategory,
    addCategory,
    removeCategory,
    startLiveMode,
    endLiveMode,
    goToNextPitch,
    goToPreviousPitch,
    startWinnerShowcase,
    endWinnerShowcase,
    resetAllRatings,
  };

  return (
    <PitchContext.Provider value={value}>{children}</PitchContext.Provider>
  );
}
