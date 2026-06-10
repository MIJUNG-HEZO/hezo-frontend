import { cn } from "@/lib/utils";

export function Logo({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center bg-primary-500 shadow-xs"
        style={{ width: size, height: size, borderRadius: size * 0.25 }}
      >
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 14 14" fill="none">
          <path
            d="M3 1V13M3 7H11M11 1V13"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={cn(
          "font-display font-extrabold tracking-[-0.02em]",
          dark ? "text-white" : "text-gray-900",
        )}
        style={{ fontSize: size * 0.62 }}
      >
        HEZO
      </span>
    </div>
  );
}
