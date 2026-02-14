"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">오류가 발생했습니다</h1>
      <p className="text-muted-foreground mb-8">
        페이지를 불러오는 중 문제가 발생했습니다.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        다시 시도
      </button>
    </div>
  );
}
