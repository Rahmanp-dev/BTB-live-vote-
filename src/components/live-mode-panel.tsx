"use client";

import { useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { PitchContext } from '@/context/PitchContext';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function LiveModePanel() {
  const {
    pitches,
    categories,
    currentPitchId,
    setCurrentPitch,
    goToNextPitch,
    goToPreviousPitch,
  } = useContext(PitchContext);

  const visiblePitches = pitches.filter(p => p.visible);

  const pitchesByCategory = categories.reduce((acc, category) => {
    const categoryPitches = visiblePitches.filter(p => p.category === category);
    if (categoryPitches.length > 0) {
      acc[category] = categoryPitches;
    }
    return acc;
  }, {} as Record<string, typeof pitches>);

  const currentPitch = visiblePitches.find(p => p.id === currentPitchId);

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Live Presentation Control</CardTitle>
            <CardDescription>
              Select a pitch to make it live for the audience.
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Button size="icon" variant="outline" onClick={goToPreviousPitch}>
              <ChevronLeft />
            </Button>
            <Button size="icon" variant="outline" onClick={goToNextPitch}>
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(pitchesByCategory).length === 0 ? (
           <p className="text-muted-foreground">No visible pitches to present.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(pitchesByCategory).map(([category, categoryPitches]) => (
              <div key={category}>
                <h4 className="font-semibold mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {categoryPitches.map(pitch => (
                    <Button
                      key={pitch.id}
                      variant={pitch.id === currentPitchId ? 'default' : 'secondary'}
                      onClick={() => setCurrentPitch(pitch.id)}
                    >
                      {pitch.title}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
