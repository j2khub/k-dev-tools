import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "퇴직금 계산기",
  description: "근로기준법에 따라 1년 이상 근무한 근로자의 퇴직금을 계산합니다",
  alternates: { canonical: "/tools/severance-calc/" },
  openGraph: {
    title: "퇴직금 계산기",
    description: "근로기준법에 따라 1년 이상 근무한 근로자의 퇴직금을 계산합니다",
    url: "/tools/severance-calc/",
  },
  twitter: {
    title: "퇴직금 계산기 | AlphaK Tools",
    description: "근로기준법에 따라 1년 이상 근무한 근로자의 퇴직금을 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
