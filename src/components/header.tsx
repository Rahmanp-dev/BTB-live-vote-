import { Logo } from './logo';

export function Header() {
  return (
    <header className="p-4 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-headline">Behind The Build</h1>
        </div>
        <Logo />
      </div>
    </header>
  );
}
