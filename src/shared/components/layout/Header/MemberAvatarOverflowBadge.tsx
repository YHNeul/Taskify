interface MemberAvatarOverflowBadgeProps {
  extraCount: number;
  visibleCount: number;
  hiddenNicknames: string;
}

export default function MemberAvatarOverflowBadge({
  extraCount,
  visibleCount,
  hiddenNicknames,
}: MemberAvatarOverflowBadgeProps) {
  if (extraCount <= 0) {
    return null;
  }

  return (
    <div
      className="group relative -ml-2 flex h-profile-desktop w-profile-desktop shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-200 px-2 text-xs-semibold text-gray-600 cursor-default select-none"
      style={{ zIndex: visibleCount + 1 }}
    >
      +{extraCount}
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-xl bg-gray-600 px-2 py-1 text-xs-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
        {hiddenNicknames}
      </span>
    </div>
  );
}
