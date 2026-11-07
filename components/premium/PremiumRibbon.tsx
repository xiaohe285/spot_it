export default function PremiumRibbon({ premium }: { premium?: boolean }) {
  if (!premium) return null;
  return <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-28 w-28 overflow-hidden" role="img" aria-label="Premium puzzle"><span className="absolute bottom-5 -right-8 w-40 -rotate-45 border-y border-amber-200 bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-100 py-1 text-center text-xs font-black tracking-wide text-amber-950 shadow-md">Premium</span></div>;
}
