/**
 * 남은 시간(초)을 "M:SS" 형식 문자열로 변환합니다.
 *
 * @param seconds - 남은 시간(초). 음수일 경우 "0:00"을 반환합니다.
 * @returns "M:SS" 형식 문자열 (예: 599 → "9:59", 60 → "1:00", 5 → "0:05")
 *
 * Validates: Requirements 3.2
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const paddedSecs = secs.toString().padStart(2, "0");

  return `${minutes}:${paddedSecs}`;
}
