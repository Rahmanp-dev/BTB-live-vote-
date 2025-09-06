'use client';

import type { Pitch } from '@/lib/types';
import { createContext, useState, type ReactNode } from 'react';

interface PitchContextType {
  pitches: Pitch[];
  categories: string[];
  addPitch: (pitch: Omit<Pitch, 'id' | 'rating' | 'visible' | 'ratings'>) => void;
  removePitch: (pitchId: number) => void;
  togglePitchVisibility: (pitchId: number, isVisible: boolean) => void;
  updatePitchRating: (pitchId: number, newRating: number) => void;
  getWinnerForCategory: (category: string) => Pitch | null;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
}

export const PitchContext = createContext<PitchContextType>({
  pitches: [],
  categories: [],
  addPitch: () => {},
  removePitch: () => {},
  togglePitchVisibility: () => {},
  updatePitchRating: () => {},
  getWinnerForCategory: () => null,
  addCategory: () => {},
  removeCategory: () => {},
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
    // Optional: Also remove pitches associated with this category
    // setPitches(prev => prev.filter(p => p.category !== categoryToRemove));
  };

  const value = {
    pitches,
    categories,
    addPitch,
    removePitch,
    togglePitchVisibility,
    updatePitchRating,
    getWinnerForCategory,
    addCategory,
    removeCategory,
  };

  return (
    <PitchContext.Provider value={value}>{children}</PitchContext.Provider>
  );
}
