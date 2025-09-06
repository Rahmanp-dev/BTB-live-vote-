'use client';

import type { Pitch } from '@/lib/types';
import { createContext, useState, type ReactNode } from 'react';

interface PitchContextType {
  pitches: Pitch[];
  categories: string[];
  isLiveMode: boolean;
  currentPitchId: number | null;
  addPitch: (pitch: Omit<Pitch, 'id' | 'rating' | 'visible' | 'ratings'>) => void;
  removePitch: (pitchId: number) => void;
  togglePitchVisibility: (pitchId: number, isVisible: boolean) => void;
  updatePitchRating: (pitchId: number, newRating: number) => void;
  getWinnerForCategory: (category: string) => Pitch | null;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  toggleLiveMode: () => void;
  setCurrentPitch: (pitchId: number | null) => void;
  goToNextPitch: () => void;
  goToPreviousPitch: () => void;
}

export const PitchContext = createContext<PitchContextType>({
  pitches: [],
  categories: [],
  isLiveMode: false,
  currentPitchId: null,
  addPitch: () => {},
  removePitch: () => {},
  togglePitchVisibility: () => {},
  updatePitchRating: () => {},
  getWinnerForCategory: () => null,
  addCategory: () => {},
  removeCategory: () => {},
  toggleLiveMode: () => {},
  setCurrentPitch: () => {},
  goToNextPitch: () => {},
  goToPreviousPitch: () => {},
});

const defaultCategories = [
  'Web Development',
  '3D Animation',
  'Video Editing',
  'VFX',
];

export function PitchProvider({ children }: { children: ReactNode }) {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentPitchId, setCurrentPitchId] = useState<number | null>(null);

  const addPitch = (
    newPitch: Omit<Pitch, 'id' | 'rating' | 'visible' | 'ratings'>
  ) => {
    setPitches((prevPitches) => [
      ...prevPitches,
      {
        ...newPitch,
        id: (prevPitches[prevPitches.length - 1]?.id ?? 0) + 1,
        rating: 0,
        ratings: [],
        visible: true,
      },
    ]);
  };

  const removePitch = (pitchId: number) => {
    setPitches((prevPitches) => prevPitches.filter((p) => p.id !== pitchId));
  };

  const togglePitchVisibility = (pitchId: number, isVisible: boolean) => {
    setPitches((prevPitches) =>
      prevPitches.map((p) =>
        p.id === pitchId ? { ...p, visible: isVisible } : p
      )
    );
  };

  const updatePitchRating = (pitchId: number, newRating: number) => {
    setPitches((prevPitches) =>
      prevPitches.map((p) => {
        if (p.id === pitchId) {
          const newRatings = [...p.ratings, newRating];
          const newAverage =
            newRatings.reduce((a, b) => a + b, 0) / newRatings.length;
          return { ...p, ratings: newRatings, rating: newAverage };
        }
        return p;
      })
    );
  };

  const getWinnerForCategory = (category: string): Pitch | null => {
    const categoryPitches = pitches.filter((p) => p.category === category);
    if (categoryPitches.length === 0) {
      return null;
    }
    return categoryPitches.sort((a, b) => b.rating - a.rating)[0];
  };

  const addCategory = (category: string) => {
    setCategories((prevCategories) => [...prevCategories, category]);
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories((prevCategories) =>
      prevCategories.filter((c) => c !== categoryToRemove)
    );
  };

  const toggleLiveMode = () => {
    setIsLiveMode(prev => {
      if (!prev) { // If turning live mode ON
        const sortedPitches = getSortedPitches();
        if (sortedPitches.length > 0) {
          setCurrentPitchId(sortedPitches[0].id);
        } else {
          setCurrentPitchId(null);
        }
      } else { // If turning live mode OFF
        setCurrentPitchId(null);
      }
      return !prev;
    });
  };

  const setCurrentPitch = (pitchId: number | null) => {
    setCurrentPitchId(pitchId);
  };
  
  const getSortedPitches = () => {
    return pitches
      .filter(p => p.visible)
      .sort((a, b) => {
        const catA = categories.indexOf(a.category);
        const catB = categories.indexOf(b.category);
        if (catA !== catB) {
          return catA - catB;
        }
        return a.id - b.id; // Fallback sort by ID
      });
  };

  const goToNextPitch = () => {
    const sortedPitches = getSortedPitches();
    const currentIndex = sortedPitches.findIndex(p => p.id === currentPitchId);
    if (currentIndex > -1 && currentIndex < sortedPitches.length - 1) {
      setCurrentPitchId(sortedPitches[currentIndex + 1].id);
    }
  };

  const goToPreviousPitch = () => {
    const sortedPitches = getSortedPitches();
    const currentIndex = sortedPitches.findIndex(p => p.id === currentPitchId);
    if (currentIndex > 0) {
      setCurrentPitchId(sortedPitches[currentIndex - 1].id);
    }
  };


  const value = {
    pitches,
    categories,
    isLiveMode,
    currentPitchId,
    addPitch,
    removePitch,
    togglePitchVisibility,
    updatePitchRating,
    getWinnerForCategory,
    addCategory,
    removeCategory,
    toggleLiveMode,
    setCurrentPitch,
    goToNextPitch,
    goToPreviousPitch,
  };

  return (
    <PitchContext.Provider value={value}>{children}</PitchContext.Provider>
  );
}
