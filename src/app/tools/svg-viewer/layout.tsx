import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG 뷰어",
  description: "SVG 코드를 붙여넣으면 실시간으로 미리보기합니다",
  alternates: { canonical: "/tools/svg-viewer/" },
  openGraph: {
    title: "SVG 뷰어",
    description: "SVG 코드를 붙여넣으면 실시간으로 미리보기합니다",
    url: "/tools/svg-viewer/",
  },
  twitter: {
    title: "SVG 뷰어 | AlphaK Tools",
    description: "SVG 코드를 붙여넣으면 실시간으로 미리보기합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
