import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "온라인 도구 모음",
  description:
    "PDF 편집, 이미지 변환, 계산기, 텍스트 처리, 개발 도구 등 70개 이상의 무료 온라인 도구를 브라우저에서 바로 사용하세요.",
  alternates: { canonical: "/tools/" },
  openGraph: {
    title: "온라인 도구 모음",
    description:
      "PDF 편집, 이미지 변환, 계산기, 텍스트 처리, 개발 도구 등 70개 이상의 무료 온라인 도구",
    url: "/tools",
  },
  twitter: {
    title: "온라인 도구 모음 | AlphaK Tools",
    description:
      "PDF 편집, 이미지 변환, 계산기, 텍스트 처리, 개발 도구 등 70개 이상의 무료 온라인 도구",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
