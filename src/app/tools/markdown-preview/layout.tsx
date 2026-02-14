import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마크다운 미리보기",
  description: "마크다운 텍스트를 실시간으로 렌더링하여 미리봅니다",
  alternates: { canonical: "/tools/markdown-preview/" },
  openGraph: {
    title: "마크다운 미리보기",
    description: "마크다운 텍스트를 실시간으로 렌더링하여 미리봅니다",
    url: "/tools/markdown-preview/",
  },
  twitter: {
    title: "마크다운 미리보기 | AlphaK Tools",
    description: "마크다운 텍스트를 실시간으로 렌더링하여 미리봅니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
