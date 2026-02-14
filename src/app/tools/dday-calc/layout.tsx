import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "디데이 계산기",
  description: "특정 날짜까지 남은 일수를 계산합니다",
  alternates: { canonical: "/tools/dday-calc/" },
  openGraph: {
    title: "디데이 계산기",
    description: "특정 날짜까지 남은 일수를 계산합니다",
    url: "/tools/dday-calc/",
  },
  twitter: {
    title: "디데이 계산기 | AlphaK Tools",
    description: "특정 날짜까지 남은 일수를 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
