import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대출이자 계산기",
  description: "원리금균등상환 또는 원금균등상환 방식으로 대출 이자와 월 납입금을 계산합니다",
  alternates: { canonical: "/tools/loan-calc/" },
  openGraph: {
    title: "대출이자 계산기",
    description: "원리금균등상환 또는 원금균등상환 방식으로 대출 이자와 월 납입금을 계산합니다",
    url: "/tools/loan-calc/",
  },
  twitter: {
    title: "대출이자 계산기 | AlphaK Tools",
    description: "원리금균등상환 또는 원금균등상환 방식으로 대출 이자와 월 납입금을 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
