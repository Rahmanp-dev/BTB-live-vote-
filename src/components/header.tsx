import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className="p-4 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <h1 className="text-2xl font-bold font-headline hidden sm:block">
            Behind The Build
          </h1>
        </div>
      </div>
    </header>
  );
}
