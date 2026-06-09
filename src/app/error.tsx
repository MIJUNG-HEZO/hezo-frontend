"use client";

import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-[400px] max-w-full rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50">
          <Icon name="triangle-alert" size={28} className="text-error-600" />
        </div>
        <h2 className="mb-2 font-display text-lg font-bold text-gray-900">오류가 발생했습니다</h2>
        <p className="mb-6 text-sm text-gray-500">
          {error.message || "예기치 않은 오류가 발생했습니다. 다시 시도해 주세요."}
        </p>
        <Button hierarchy="primary" size="md" onClick={reset}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}
