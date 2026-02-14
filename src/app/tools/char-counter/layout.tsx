import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "글자수/단어수 카운터",
  description: "텍스트의 글자수, 단어수, 줄수 등을 실시간으로 계산합니다",
  alternates: { canonical: "/tools/char-counter/" },
  openGraph: {
    title: "글자수/단어수 카운터",
    description: "텍스트의 글자수, 단어수, 줄수 등을 실시간으로 계산합니다",
    url: "/tools/char-counter/",
  },
  twitter: {
    title: "글자수/단어수 카운터 | AlphaK Tools",
    description: "텍스트의 글자수, 단어수, 줄수 등을 실시간으로 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
