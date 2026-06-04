// 인증 및 사이트 발급 상태 관리

export type UserState = "not_logged_in" | "logged_in_no_site" | "logged_in_has_site";

export function getUserState(): UserState {
  if (typeof window === "undefined") return "not_logged_in";
  
  // 1. 명시적으로 저장된 상태가 있으면 사용
  const savedState = localStorage.getItem("hezo_user_state");
  if (savedState) return savedState as UserState;
  
  // 2. JWT 토큰이 있으면 로그인 상태로 판단
  const token = localStorage.getItem("access_token");
  if (token) return "logged_in_no_site";
  
  // 3. 기본: 비로그인
  return "not_logged_in";
}

export function setUserState(state: UserState) {
  if (typeof window !== "undefined") {
    localStorage.setItem("hezo_user_state", state);
  }
}

// 라우팅 결정
export function getRedirectPath(state: UserState, currentPath: string): string | null {
  switch (state) {
    case "not_logged_in":
      if (currentPath !== "/auth/login" && currentPath !== "/auth/register") {
        return "/auth/login";
      }
      return null;

    case "logged_in_has_site":
      if (currentPath === "/chat") {
        return "/";
      }
      return null;

    case "logged_in_no_site":
      return null;

    default:
      return null;
  }
}
