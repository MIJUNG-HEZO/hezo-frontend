import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizeMap: Record<AvatarSize, { box: string; text: string; dot: string }> = {
  sm: { box: "h-8 w-8", text: "text-xs", dot: "h-2 w-2" },
  md: { box: "h-10 w-10", text: "text-sm", dot: "h-2.5 w-2.5" },
  lg: { box: "h-12 w-12", text: "text-base", dot: "h-3 w-3" },
};

function initials(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  // Korean names: use the first character. Latin names: up to two initials.
  if (/[가-힣]/.test(t[0])) return t[0];
  return t
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  size = "md",
  status,
  className,
}: {
  name: string;
  size?: AvatarSize;
  status?: "online" | "offline";
  className?: string;
}) {
  const s = sizeMap[size];
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700",
        s.box,
        s.text,
        className,
      )}
    >
      {initials(name)}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white",
            s.dot,
            status === "online" ? "bg-success-500" : "bg-gray-300",
          )}
        />
      )}
    </span>
  );
}
