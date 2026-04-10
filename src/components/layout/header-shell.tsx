import Link from 'next/link';

export function HeaderShell() {
  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link className="text-sm font-semibold tracking-tight" href="/">
          HayDeals
        </Link>
      </div>
    </header>
  );
}
