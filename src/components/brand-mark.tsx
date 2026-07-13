type BrandMarkProps = { className?: string };

export default function BrandMark({ className = "h-11 w-11" }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="MaryTaste"
      className={className}
    >
      <circle cx="32" cy="32" r="30" fill="#315c42" />
      <path
        d="M16 44V21l16 16 16-16v23"
        fill="none"
        stroke="#f8f5ee"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M43 13c7 0 10 4 9 10-6 1-10-2-9-10Z" fill="#c56d45" />
      <path
        d="m43 23 8-9"
        stroke="#f8f5ee"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
