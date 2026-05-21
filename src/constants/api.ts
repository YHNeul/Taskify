const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not set. Define it in .env.local (e.g. NEXT_PUBLIC_API_URL=https://sp-taskify-api.vercel.app/22-2).',
  );
}

/** .env.local의 NEXT_PUBLIC_API_URL로 관리되는 최종 API base URL */
export const API_BASE_URL = apiBaseUrl;
