import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS 인라이너",
  description: "CSS 스타일을 HTML 인라인 스타일로 변환합니다",
  alternates: { canonical: "/tools/css-inliner/" },
  openGraph: {
    title: "CSS 인라이너",
    description: "CSS 스타일을 HTML 인라인 스타일로 변환합니다",
    url: "/tools/css-inliner/",
  },
  twitter: {
    title: "CSS 인라이너 | AlphaK Tools",
    description: "CSS 스타일을 HTML 인라인 스타일로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
