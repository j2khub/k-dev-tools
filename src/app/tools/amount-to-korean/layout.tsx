import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "금액 한글 변환기",
  description: "숫자 금액을 한글 표기로 변환합니다",
  alternates: { canonical: "/tools/amount-to-korean/" },
  openGraph: {
    title: "금액 한글 변환기",
    description: "숫자 금액을 한글 표기로 변환합니다",
    url: "/tools/amount-to-korean/",
  },
  twitter: {
    title: "금액 한글 변환기 | AlphaK Tools",
    description: "숫자 금액을 한글 표기로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
