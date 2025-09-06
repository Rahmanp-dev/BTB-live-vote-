'use client';

import { useContext, useEffect } from 'react';
import { WinnerDisplay } from '@/components/winner-display';
import { PitchContext } from '@/context/PitchContext';
import { useRouter } from 'next/navigation';

export default function ShowcasePage() {
  const { isWinnerShowcaseLive, showcasedPitch, loading } = useContext(PitchContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isWinnerShowcaseLive) {
      router.push('/');
    }
  }, [loading, isWinnerShowcaseLive, router]);

  if (loading || !isWinnerShowcaseLive) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Waiting for the winner announcement...</p>
      </div>
    );
  }

  return <WinnerDisplay pitch={showcasedPitch} />;
}
