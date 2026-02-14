import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-8">
        요청하신 페이지를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
