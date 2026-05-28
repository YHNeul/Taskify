/**
 * @description Taskify 타이포그래피 및 컬러 시스템 활용 가이드
 * * ### 1. 텍스트 스타일 (Font Size & Weight)
 * Tailwind의 `text-{key}` 규칙을 사용하여 적용
 * - **Usage:** `<p className="text-3xl-bold">...</p>`
 * * | Size Key | 실제 수치 (Size / LineHeight / Weight) |
 * |:---|:---|
 * | `3xl-bold` | 32px / 42px / 700 |
 * | `2xl-semibold` | 24px / 32px / 600 |
 * | `lg-medium` | 16px / 26px / 500 |
 * | `xs-regular` | 12px / 18px / 400 |
 * * ### 2. 컬러 시스템 (Colors)
 * 설정된 컬러는 아래와 같이 접두사를 붙여 사용합니다.
 * - **텍스트 색상:** `text-{color}-{level}` (예: `text-gray-600`)
 * - **배경 색상:** `bg-{color}-{level}` (예: `bg-white`)
 * - **테두리 색상:** `border-{color}-{level}` (예: `border-gray-300`)
 * * @example
 * // 예시: 회색 배경에 큰 볼드체 텍스트
 * <div className="bg-gray-600 text-3xl-bold text-white">
 * 대시보드 관리
 * </div>
 */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /** Taskify의 메인 색상 */
        brand: {
          violet: '#5534DA',
          'violet-light': '#F1EFFD',
        },
        /** 100(가장 밝음) ~ 900(가장 어두움/Black) */
        gray: {
          100: '#FAFAFA',
          200: '#EEEEEE',
          300: '#D9D9D9',
          400: '#9FA6B2',
          500: '#787486',
          600: '#4B4B4B',
          700: '#333236',
          800: '#171717',
          900: '#000000',
        },
        white: '#FFFFFF',
        red: '#D6173A',
        green: '#7AC555',
        purple: '#760DDE',
        orange: '#FFA500',
        blue: '#76A5EA',
        pink: '#E876EA',
      },
      fontFamily: {
        main: ['var(--font-pretendard)', 'sans-serif'],
        landing: ['var(--font-landing-montserrat)', 'sans-serif'],
      },
      fontSize: {
        '3xl-bold': ['32px', { lineHeight: '42px', fontWeight: '700' }],
        '3xl-semibold': ['32px', { lineHeight: '42px', fontWeight: '600' }],
        '2xl-bold': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        '2xl-semibold': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        '2xl-medium': ['24px', { lineHeight: '32px', fontWeight: '500' }],
        '2xl-regular': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'xl-bold': ['20px', { lineHeight: '32px', fontWeight: '700' }],
        'xl-semibold': ['20px', { lineHeight: '32px', fontWeight: '600' }],
        'xl-medium': ['20px', { lineHeight: '32px', fontWeight: '500' }],
        'xl-regular': ['20px', { lineHeight: '32px', fontWeight: '400' }],
        '2lg-bold': ['18px', { lineHeight: '26px', fontWeight: '700' }],
        '2lg-semibold': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        '2lg-medium': ['18px', { lineHeight: '26px', fontWeight: '500' }],
        '2lg-regular': ['18px', { lineHeight: '26px', fontWeight: '400' }],
        'lg-bold': ['16px', { lineHeight: '26px', fontWeight: '700' }],
        'lg-semibold': ['16px', { lineHeight: '26px', fontWeight: '600' }],
        'lg-medium': ['16px', { lineHeight: '26px', fontWeight: '500' }],
        'lg-regular': ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'md-bold': ['14px', { lineHeight: '24px', fontWeight: '700' }],
        'md-semibold': ['14px', { lineHeight: '24px', fontWeight: '600' }],
        'md-medium': ['14px', { lineHeight: '24px', fontWeight: '500' }],
        'md-regular': ['14px', { lineHeight: '24px', fontWeight: '400' }],
        'sm-semibold': ['13px', { lineHeight: '22px', fontWeight: '600' }],
        'sm-medium': ['13px', { lineHeight: '22px', fontWeight: '500' }],
        'xs-semibold': ['12px', { lineHeight: '20px', fontWeight: '600' }],
        'xs-medium': ['12px', { lineHeight: '18px', fontWeight: '500' }],
        'xs-regular': ['12px', { lineHeight: '18px', fontWeight: '400' }],
      },
      lineHeight: {
        19: '19px',
      },
      spacing: {
        17: '17px',
        53: '53px',
        58: '58px',
        68: '68px',
        70: '70px',
        'space-22': '22px',
        'space-26': '26px',
        'space-19': '19px',
        'space-34': '34px',
        'space-30': '30px',
        'space-57': '57px',
      },
      width: {
        'logo-icon-mobile': '120px',
        'logo-icon-desktop': '200px',
        'logo-text-mobile': '140px',
        'logo-text-desktop': '198px',
        'dashboard-column': '354px',
        'dashboard-column-inner': '314px',
        'avatar-26': '26px',
        'back-icon-mobile': '18px',
        'invite-button-mobile': '86px',
        'invite-button-desktop': '105px',
        'action-button-mobile': '52px',
        'action-button-desktop': '84px',
        'modal-form': '568px',
        'modal-card': '584px',
        'content-450': '450px',
        'sidebar-mobile': '67px',
        'sidebar-tablet': '160px',
        'sidebar-desktop': '300px',
        'profile-mobile': '34px',
        'profile-desktop': '38px',
      },
      height: {
        'auth-input': '50px',
        'delete-dashboard-mobile': '52px',
        'delete-dashboard-desktop': '62px',
        'dashboard-add-mobile': '66px',
        'dashboard-add-desktop': '70px',
        'members-panel-mobile': '337px',
        'members-panel-desktop': '404px',
        'invites-panel-mobile': '407px',
        'invites-panel-desktop': '477px',
        'invite-button-mobile': '26px',
        'profile-mobile': '34px',
        'profile-desktop': '38px',
      },
      maxWidth: {
        'auth-form': '520px',
        'dashboard-edit': '620px',
      },
      minWidth: {
        'delete-dashboard': '320px',
        'card-detail-content': '664px',
      },
      minHeight: {
        'screen-without-header': 'calc(100vh - 64px)',
        'screen-dvh-without-header': 'calc(100dvh - 64px)',
        'column-dropzone': '60px',
      },
      maxHeight: {
        'screen-minus-110': 'calc(100vh - 110px)',
        'screen-minus-160': 'calc(100vh - 160px)',
      },
      inset: {
        'invite-button-top': '72px',
      },
      screens: {
        mobile: '375px',
        tablet: '744px',
        desktop: '1280px',
      },
    },
  },
  plugins: [],
};
