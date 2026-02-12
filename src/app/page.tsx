import Link from "next/link";
import { Wrench, CalendarDays, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">AlphaK Tools</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          빠르고 무료인 온라인 도구 모음.
          <br />
          내 데이터는 내 브라우저 안에서만. 서버 전송 없음.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          href="/tools"
          className="group flex flex-col gap-4 p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">도구 모음</h2>
            <p className="text-sm text-muted-foreground">
              PDF, 계산기, 변환, 텍스트, 이미지, 생성기, 개발도구 등 70개 이상의
              유틸리티
            </p>
          </div>
        </Link>

        <Link
          href="/calendar"
          className="group flex flex-col gap-4 p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-1">공휴일 달력</h2>
            <p className="text-sm text-muted-foreground">
              국가별 공휴일 확인, 월별 달력 뷰, 다음 공휴일 D-day 표시
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
