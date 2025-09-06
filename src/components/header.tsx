import { Presentation } from 'lucide-react';

export function Header() {
  return (
    <header className="p-4 border-b border-border/50">
      <div className="container mx-auto flex items-center gap-2">
        <Presentation className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold font-headline">PitchRate</h1>
      </div>
    </header>
  );
}
