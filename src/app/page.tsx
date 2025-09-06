import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome to PitchRate</h2>
          <p className="text-muted-foreground mt-2">
            This is your application starter. You can now build your features.
          </p>
        </div>
      </main>
    </div>
  );
}
