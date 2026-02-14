import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "백분율 계산기",
  description: "백분율 계산, 비율 구하기, 증감률을 계산합니다",
  alternates: { canonical: "/tools/percentage-calc/" },
  openGraph: {
    title: "백분율 계산기",
    description: "백분율 계산, 비율 구하기, 증감률을 계산합니다",
    url: "/tools/percentage-calc/",
  },
  twitter: {
    title: "백분율 계산기 | AlphaK Tools",
    description: "백분율 계산, 비율 구하기, 증감률을 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
