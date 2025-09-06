export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <span className="text-lg font-bold">GWD</span>
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold text-foreground">
          GWD Global Pvt Ltd
        </div>
        <div className="text-xs text-muted-foreground">Presents</div>
      </div>
    </div>
  );
}
