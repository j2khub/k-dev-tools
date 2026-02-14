import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "연봉/실수령액 계산기",
  description: "연봉을 입력하면 4대보험, 소득세 등을 공제한 월 실수령액을 계산합니다",
  alternates: { canonical: "/tools/salary-calc/" },
  openGraph: {
    title: "연봉/실수령액 계산기",
    description: "연봉을 입력하면 4대보험, 소득세 등을 공제한 월 실수령액을 계산합니다",
    url: "/tools/salary-calc/",
  },
  twitter: {
    title: "연봉/실수령액 계산기 | AlphaK Tools",
    description: "연봉을 입력하면 4대보험, 소득세 등을 공제한 월 실수령액을 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
