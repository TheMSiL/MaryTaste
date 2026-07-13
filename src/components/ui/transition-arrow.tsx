type TransitionArrowProps = {
  external?: boolean;
  back?: boolean;
};

export default function TransitionArrow({
  external = false,
  back = false,
}: TransitionArrowProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-current/10 transition-transform duration-300  ${back ? "rotate-180" : ""}`}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5 fill-none stroke-current"
        strokeWidth="1.8"
      >
        <path
          d={external ? "M6 14 14 6M8 6h6v6" : "M4 10h11m-4-4 4 4-4 4"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
