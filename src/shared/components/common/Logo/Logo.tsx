/**
 * @file Logo.tsx
 * @description Taskify 서비스 로고 컴포넌트입니다.
 * large: 깃털 아이콘 + Taskify 텍스트 (데스크탑/태블릿)
 * small: 깃털 아이콘만 (모바일)
 */

import Image from 'next/image';

interface LogoProps {
  /**
   * 로고 크기 variant
   * - `large`: 아이콘(29×34) + 텍스트(80×22) — 데스크탑/태블릿용
   * - `small`: 아이콘(24×28)만 — 모바일용
   * @default 'large'
   */
  variant?: 'large' | 'small';
}

const Logo = ({ variant = 'large' }: LogoProps) => {
  if (variant === 'small') {
    return (
      <Image
        src="/logo-taskify-icon-sm.svg"
        width={24}
        height={28}
        alt="Taskify"
        priority
      />
    );
  }

  return (
    <div className="flex items-center">
      <Image
        src="/logo-taskify-icon-lg.svg"
        width={29}
        height={34}
        alt=""
        priority
      />
      <Image
        src="/logo-taskify-text-lg.svg"
        width={80}
        height={22}
        alt="Taskify"
        priority
      />
    </div>
  );
};

export default Logo;
