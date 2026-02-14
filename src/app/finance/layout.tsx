import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "금융 시장",
  description:
    "주요 주가지수(코스피, 코스닥, S&P 500, 나스닥)와 환율 정보를 실시간으로 확인하세요.",
  alternates: { canonical: "/finance/" },
  openGraph: {
    title: "금융 시장",
    description: "주요 주가지수와 환율 정보를 실시간으로 확인",
    url: "/finance",
  },
  twitter: {
    title: "금융 시장 | AlphaK Tools",
    description: "주요 주가지수와 환율 정보를 실시간으로 확인",
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
