import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "평수 변환기",
  description: "평(坪)과 제곱미터(㎡)를 상호 변환합니다",
  alternates: { canonical: "/tools/pyeong-calc/" },
  openGraph: {
    title: "평수 변환기",
    description: "평(坪)과 제곱미터(㎡)를 상호 변환합니다",
    url: "/tools/pyeong-calc/",
  },
  twitter: {
    title: "평수 변환기 | AlphaK Tools",
    description: "평(坪)과 제곱미터(㎡)를 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
