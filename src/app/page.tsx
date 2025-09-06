import { Header } from '@/components/header';
import { PitchCard } from '@/components/pitch-card';
import { pitches } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Pitches Ready for Review</h2>
            <p className="text-muted-foreground mt-2">
              Browse the pitches below and cast your vote.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pitches.map((pitch) => (
              <PitchCard key={pitch.id} pitch={pitch} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
