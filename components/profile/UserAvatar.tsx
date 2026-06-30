import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const avatarColors = [
  "bg-[#0F223A]",
  "bg-slate-700",
  "bg-blue-900",
  "bg-indigo-900",
  "bg-cyan-700",
  "bg-slate-700",
];

function getDisplayName(name?: string | null, username?: string | null) {
  return name?.trim() || username?.trim() || "Sessio";
}

function getInitials(name?: string | null, username?: string | null) {
  const displayName = getDisplayName(name, username);
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

function colorForName(name: string) {
  const hash = Array.from(name).reduce(
    (total, char) => total + char.charCodeAt(0),
    0,
  );

  return avatarColors[hash % avatarColors.length];
}

export function UserAvatar({
  name,
  username,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const displayName = getDisplayName(name, username);
  const initials = getInitials(name, username);

  return (
    <span
      role="img"
      aria-label={`${displayName} avatar`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-white/70 bg-cover bg-center font-semibold text-white shadow-sm",
        avatarUrl ? "bg-muted" : colorForName(displayName),
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
      }}
    >
      {avatarUrl ? null : initials}
    </span>
  );
}
