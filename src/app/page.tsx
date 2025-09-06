'use client';

import { useContext } from 'react';
import { Header } from '@/components/header';
import { PitchCard } from '@/components/pitch-card';
import { PitchContext } from '@/context/PitchContext';
import type { Pitch } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { pitches, loading, isLiveMode } = useContext(PitchContext);

  if (loading) {
    return (
       <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="container mx-auto">
                <div className="text-center mb-8">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-4" />
                </div>
                <div className="space-y-12">
                    <div>
                        <Skeleton className="h-8 w-1/4 mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-48 w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    );
  }

  const visiblePitches = pitches.filter((pitch) => pitch.visible);

  const pitchesByCategory = visiblePitches.reduce((acc, pitch) => {
    if (!acc[pitch.category]) {
      acc[pitch.category] = [];
    }
    acc[pitch.category].push(pitch);
    return acc;
  }, {} as Record<string, Pitch[]>);

  const categories = Object.keys(pitchesByCategory).sort();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      {isLiveMode && (
        <div className="bg-primary text-primary-foreground text-center p-4">
            <div className="container mx-auto">
                <p className="font-bold text-lg animate-pulse">
                    Live Event in Progress!
                </p>
                <Button asChild variant="secondary" className="mt-2">
                    <Link href="/live">Click here to join</Link>
                </Button>
            </div>
        </div>
      )}
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Pitches Ready for Review</h2>
            <p className="text-muted-foreground mt-2">
              Browse the pitches below and cast your vote.
            </p>
          </div>
          {categories.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No pitches are available for voting at the moment.
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => (
                <section key={category}>
                  <h3 className="text-2xl font-bold mb-6 border-b pb-2">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pitchesByCategory[category].map((pitch) => (
                      <PitchCard key={pitch._id} pitch={pitch} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
