type BrandMarkProps = { className?: string };

export default function BrandMark({ className = "h-11 w-11" }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="MaryTaste"
      className={className}
    >
      <circle cx="32" cy="32" r="30" fill="#756A8A" />
      <path
        d="M16 44V21l16 16 16-16v23"
        fill="none"
        stroke="#FAF8FC"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
