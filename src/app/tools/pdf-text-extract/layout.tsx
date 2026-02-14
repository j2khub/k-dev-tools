import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 텍스트 추출",
  description: "PDF 파일에서 텍스트를 추출합니다",
  alternates: { canonical: "/tools/pdf-text-extract/" },
  openGraph: {
    title: "PDF 텍스트 추출",
    description: "PDF 파일에서 텍스트를 추출합니다",
    url: "/tools/pdf-text-extract/",
  },
  twitter: {
    title: "PDF 텍스트 추출 | AlphaK Tools",
    description: "PDF 파일에서 텍스트를 추출합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
