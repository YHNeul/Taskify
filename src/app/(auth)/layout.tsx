export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 헤더나 사이드바 없는 로그인/회원가입 뼈대
    <div className="auth-layout-container">{children}</div>
  );
}
