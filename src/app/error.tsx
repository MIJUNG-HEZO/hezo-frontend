"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-10 border border-gray-200 w-[400px] shadow-sm text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">오류가 발생했습니다</h2>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || "예기치 않은 오류가 발생했습니다. 다시 시도해 주세요."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
