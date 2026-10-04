export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 'w-7 h-7', text: 'text-base', x: 'text-sm' },
    md: { box: 'w-8 h-8', text: 'text-lg', x: 'text-base' },
    lg: { box: 'w-12 h-12', text: 'text-2xl', x: 'text-xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`${s.box} relative shrink-0`}>
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect x="2" y="2" width="28" height="28" rx="6" fill="#0D1B2A" stroke="#38D5FF" strokeWidth="1.5" />
          <path d="M8 16 L12 10 L16 16 L20 10 L24 16" stroke="#38D5FF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="22" r="2" fill="#38D5FF" />
          <line x1="8" y1="22" x2="14" y2="22" stroke="#22344A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="22" x2="24" y2="22" stroke="#22344A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex items-baseline">
        <span className={`font-bold tracking-tight text-text-primary ${s.text}`}>
          SPECTR
        </span>
        <span className={`font-bold tracking-tight text-accent-cyan ${s.x}`}>
          X
        </span>
      </div>
    </div>
  );
}
