import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron 표현식 생성기",
  description: "Cron 표현식을 생성하고 다음 실행 시간을 확인합니다",
  alternates: { canonical: "/tools/cron-generator/" },
  openGraph: {
    title: "Cron 표현식 생성기",
    description: "Cron 표현식을 생성하고 다음 실행 시간을 확인합니다",
    url: "/tools/cron-generator/",
  },
  twitter: {
    title: "Cron 표현식 생성기 | AlphaK Tools",
    description: "Cron 표현식을 생성하고 다음 실행 시간을 확인합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
