import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 → PDF",
  description: "여러 이미지를 하나의 PDF 파일로 변환합니다",
  alternates: { canonical: "/tools/image-to-pdf/" },
  openGraph: {
    title: "이미지 → PDF",
    description: "여러 이미지를 하나의 PDF 파일로 변환합니다",
    url: "/tools/image-to-pdf/",
  },
  twitter: {
    title: "이미지 → PDF | AlphaK Tools",
    description: "여러 이미지를 하나의 PDF 파일로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
