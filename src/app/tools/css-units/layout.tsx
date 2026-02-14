import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS 단위 변환",
  description: "px과 rem 단위를 상호 변환합니다",
  alternates: { canonical: "/tools/css-units/" },
  openGraph: {
    title: "CSS 단위 변환",
    description: "px과 rem 단위를 상호 변환합니다",
    url: "/tools/css-units/",
  },
  twitter: {
    title: "CSS 단위 변환 | AlphaK Tools",
    description: "px과 rem 단위를 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
