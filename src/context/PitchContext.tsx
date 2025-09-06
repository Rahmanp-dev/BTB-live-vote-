'use client';

import type { Pitch, Category } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode } from 'react';

// This is a temporary type for the live mode state
// In a real app, this would be stored in a database (like Firebase Realtime Database)
interface LiveState {
  isLive: boolean;
  currentPitchId: string | null;
}

interface PitchContextType {
  pitches: Pitch[];
  categories: string[];
  isLiveMode: boolean;
  currentPitchId: string | null;
  loading: boolean;
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
}

export const PitchContext = createContext<PitchContextType>({
  pitches: [],
  categories: [],
  isLiveMode: false,
  currentPitchId: null,
  loading: true,
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
});

export function PitchProvider({ children }: { children: ReactNode }) {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentPitchId, setCurrentPitchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pitchesRes, categoriesRes, liveStateRes] = await Promise.all([
        fetch('/api/pitches'),
        fetch('/api/categories'),
        fetch('/api/livestate'),
      ]);

      const pitchesData = await pitchesRes.json();
      const categoriesData = await categoriesRes.json();
      const liveStateData = await liveStateRes.json();

      if (pitchesData.success) {
        const pitchesWithAvgRating = pitchesData.data.map((p: Pitch) => ({
          ...p,
          rating: p.ratings.length > 0 ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length : 0,
        }));
        setPitches(pitchesWithAvgRating);
      }
      if (categoriesData.success) {
        if (categoriesData.data.length === 0) {
            const defaultCategories = ['Web Development', '3D Animation', 'Video Editing', 'VFX'];
            await Promise.all(defaultCategories.map(name => addCategory(name, false)));
            setCategories(defaultCategories);
        } else {
            setCategories(categoriesData.data.map((c: Category) => c.name));
        }
      }
      if (liveStateData.success) {
        setIsLiveMode(liveStateData.data.isLive);
        setCurrentPitchId(liveStateData.data.currentPitchId);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Set up polling to get the latest live state
    const interval = setInterval(fetchLiveState, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);
  
  const fetchLiveState = async () => {
    try {
      const res = await fetch('/api/livestate');
      const data = await res.json();
      if (data.success) {
        setIsLiveMode(data.data.isLive);
        setCurrentPitchId(data.data.currentPitchId);
      }
    } catch (error) {
      console.error("Failed to fetch live state:", error);
    }
  };

  const updateLiveState = async (state: Partial<LiveState>) => {
    try {
      const res = await fetch('/api/livestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiveMode(data.data.isLive);
        setCurrentPitchId(data.data.currentPitchId);
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
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to remove pitch:', error);
    }
  };

  const togglePitchVisibility = async (pitchId: string, visible: boolean) => {
    try {
      const res = await fetch(`/api/pitches/${pitchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const updatePitchRating = async (pitchId: string, newRating: number) => {
    const pitch = pitches.find(p => p._id === pitchId);
    if (!pitch) return;

    const newRatings = [...pitch.ratings, newRating];
    try {
      const res = await fetch(`/api/pitches/${pitchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings: newRatings }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  const getWinnerForCategory = (category: string): Pitch | null => {
    const categoryPitches = pitches.filter((p) => p.category === category);
    if (categoryPitches.length === 0) return null;
    return categoryPitches.sort((a, b) => b.rating - a.rating)[0];
  };

  const addCategory = async (name: string, shouldFetchData = true) => {
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
    // Sorts by category order first, then by title within the category
    return pitches
      .filter(p => p.visible)
      .sort((a, b) => {
        const catAIndex = categories.indexOf(a.category);
        const catBIndex = categories.indexOf(b.category);
        if (catAIndex !== catBIndex) {
          return catAIndex - catBIndex;
        }
        return a.title.localeCompare(b.title);
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

  const value = {
    pitches,
    categories,
    isLiveMode,
    currentPitchId,
    loading,
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
  };

  return (
    <PitchContext.Provider value={value}>{children}</PitchContext.Provider>
  );
}
