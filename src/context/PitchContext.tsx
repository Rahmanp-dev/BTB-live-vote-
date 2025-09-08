
'use client';

import type { Pitch, Category } from '@/lib/types';
import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface LiveState {
  isLive: boolean;
  currentPitchId: string | null;
  isLeaderboardLive: boolean;
}

interface PitchContextType {
  pitches: Pitch[];
  categories: string[];
  isLiveMode: boolean;
  currentPitchId: string | null;
  loading: boolean;
  initialLoadComplete: boolean;
  isLeaderboardLive: boolean;
  userRatings: { [pitchId: string]: number };
  setUserRatings: React.Dispatch<React.SetStateAction<{ [pitchId: string]: number }>>;
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
  toggleLeaderboard: (isLive: boolean) => void;
  resetAllRatings: () => Promise<void>;
}

export const PitchContext = createContext<PitchContextType>({
  pitches: [],
  categories: [],
  isLiveMode: false,
  currentPitchId: null,
  loading: true,
  initialLoadComplete: false,
  isLeaderboardLive: false,
  userRatings: {},
  setUserRatings: () => {},
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
  toggleLeaderboard: () => {},
  resetAllRatings: async () => {},
});

export function PitchProvider({ children }: { children: ReactNode }) {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentPitchId, setCurrentPitchId] = useState<string | null>(null);
  const [isLeaderboardLive, setIsLeaderboardLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [userRatings, setUserRatings] = useState<{ [pitchId: string]: number }>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  const getVotedPitchesKey = useCallback(() => {
    return `votedPitches_${sessionId}`;
  }, [sessionId]);

  const loadUserRatingsFromStorage = useCallback(() => {
    if (!sessionId) return;
    try {
      const votedPitches = JSON.parse(localStorage.getItem(getVotedPitchesKey()) || '{}');
      setUserRatings(votedPitches);
    } catch (e) {
      console.error("Failed to load or parse user ratings from localStorage", e);
      setUserRatings({});
    }
  }, [sessionId, getVotedPitchesKey]);


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
      const [pitchesRes, categoriesRes, liveStateRes, sessionRes] = await Promise.all([
        fetch('/api/pitches'),
        fetch('/api/categories'),
        fetch('/api/livestate'),
        fetch('/api/session'),
      ]);

      if (pitchesRes.ok) {
        try {
            const pitchesData = await pitchesRes.json();
            if (pitchesData.success) {
              const pitchesWithAvgRating = pitchesData.data.map((p: Pitch) => ({
                ...p,
                rating: p.ratings && p.ratings.length > 0 ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length : 0,
              }));
              setPitches(pitchesWithAvgRating);
            }
        } catch (e) {
            console.error('Failed to parse pitches JSON', e)
        }
      }

      if (categoriesRes.ok) {
        try {
            const categoriesData = await categoriesRes.json();
            if (categoriesData.success) {
              if (categoriesData.data.length === 0) {
                const defaultCategories = ['Web Development', '3D Animation', 'Video Editing', 'VFX'];
                defaultCategories.forEach(name => addCategory(name, false));
                setCategories(defaultCategories);
              } else {
                setCategories(categoriesData.data.map((c: Category) => c.name));
              }
            }
        } catch(e) {
            console.error('Failed to parse categories JSON', e)
        }
      }
      
      if(liveStateRes.ok) {
        try {
            const liveStateData = await liveStateRes.json();
            if (liveStateData.success && liveStateData.data) {
              setIsLiveMode(liveStateData.data.isLive);
              setCurrentPitchId(liveStateData.data.currentPitchId);
              setIsLeaderboardLive(liveStateData.data.isLeaderboardLive);
            }
        } catch (e) {
            console.error('Failed to parse live state JSON', e)
        }
      }

      if (sessionRes.ok) {
        try {
            const sessionData = await sessionRes.json();
            if (sessionData.success && sessionData.data) {
                setSessionId(sessionData.data.sessionId);
            }
        } catch (e) {
            console.error('Failed to parse session JSON', e);
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
    loadUserRatingsFromStorage();
  }, [sessionId, loadUserRatingsFromStorage]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchLiveState = async () => {
      try {
        const res = await fetch('/api/livestate');
        if (!res.ok) return;

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;

        const liveStateData = await res.json();
        if (liveStateData.success && liveStateData.data) {
            const data = liveStateData.data;
            if (data) {
                setIsLiveMode(prev => prev !== data.isLive ? data.isLive : prev);
                setCurrentPitchId(prev => prev !== data.currentPitchId ? data.currentPitchId : prev);
                setIsLeaderboardLive(prev => prev !== data.isLeaderboardLive ? data.isLeaderboardLive : prev);
            }
        }
      } catch (error) {
        console.error("Failed to fetch live state:", error);
      } finally {
         timeoutId = setTimeout(fetchLiveState, 60000);
      }
    };
    
    timeoutId = setTimeout(fetchLiveState, 60000);

    return () => clearTimeout(timeoutId);
  }, []);

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
      const data = await res.json();
      if (data.success && data.data) {
          setIsLiveMode(data.data.isLive);
          setCurrentPitchId(data.data.currentPitchId);
          setIsLeaderboardLive(data.data.isLeaderboardLive);
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
    if (!sessionId) return;
    const pitch = pitches.find(p => p._id === pitchId);
    if (!pitch) return;

    setUserRatings(prev => ({ ...prev, [pitchId]: newRating }));
    const votedPitchesKey = getVotedPitchesKey();
    const votedPitches = JSON.parse(localStorage.getItem(votedPitchesKey) || '{}');
    votedPitches[pitchId] = newRating;
    localStorage.setItem(votedPitchesKey, JSON.stringify(votedPitches));

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

  const getWinnerForCategory = useCallback((category: string): Pitch | null => {
    const categoryPitches = pitches.filter((p) => p.category === category && p.ratings.length > 0);
    if (categoryPitches.length === 0) return null;
    return categoryPitches.sort((a, b) => b.rating - a.rating)[0];
  }, [pitches]);

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

  const toggleLeaderboard = (isLive: boolean) => {
    updateLiveState({ isLeaderboardLive: isLive });
  };

  const resetAllRatings = async () => {
    try {
      const res = await fetch('/api/pitches/reset', { method: 'POST' });
      if (res.ok) {
        await fetch('/api/session/reset', { method: 'POST' });
        // Instead of refetching everything, we just clear the local user ratings
        // and let the context update naturally on the next poll or action.
        const newSessionRes = await fetch('/api/session');
        const newSessionData = await newSessionRes.json();
        if (newSessionData.success && newSessionData.data) {
          const newSessionId = newSessionData.data.sessionId;
          setSessionId(newSessionId);
          localStorage.removeItem(`votedPitches_${sessionId}`); // remove old session votes
          setUserRatings({}); // clear ratings in the UI immediately
        }
        await fetchData(); // refetch to get empty ratings from server and new session
      } else {
        const { error } = await res.json();
        alert(`Failed to reset ratings: ${error}`);
      }
    } catch (error) {
      console.error('Failed to reset ratings:', error);
    }
  };

  const value = {
    pitches,
    categories,
    isLiveMode,
    currentPitchId,
    loading,
    initialLoadComplete,
    isLeaderboardLive,
    userRatings,
    setUserRatings,
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
    toggleLeaderboard,
    resetAllRatings,
  };

  return (
    <PitchContext.Provider value={value}>{children}</PitchContext.Provider>
  );
}
