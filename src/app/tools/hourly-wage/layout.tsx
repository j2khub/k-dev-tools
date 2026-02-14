import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "시급 계산기",
  description: "월급을 시급으로 또는 시급을 월급/연봉으로 변환합니다",
  alternates: { canonical: "/tools/hourly-wage/" },
  openGraph: {
    title: "시급 계산기",
    description: "월급을 시급으로 또는 시급을 월급/연봉으로 변환합니다",
    url: "/tools/hourly-wage/",
  },
  twitter: {
    title: "시급 계산기 | AlphaK Tools",
    description: "월급을 시급으로 또는 시급을 월급/연봉으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
