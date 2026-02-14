import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "한글 ↔ 유니코드",
  description: "한글 텍스트와 유니코드 코드포인트를 상호 변환합니다",
  alternates: { canonical: "/tools/hangul-unicode/" },
  openGraph: {
    title: "한글 ↔ 유니코드",
    description: "한글 텍스트와 유니코드 코드포인트를 상호 변환합니다",
    url: "/tools/hangul-unicode/",
  },
  twitter: {
    title: "한글 ↔ 유니코드 | AlphaK Tools",
    description: "한글 텍스트와 유니코드 코드포인트를 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
