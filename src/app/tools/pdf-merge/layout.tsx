import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 병합",
  description: "여러 PDF 파일을 하나로 합칩니다",
  alternates: { canonical: "/tools/pdf-merge/" },
  openGraph: {
    title: "PDF 병합",
    description: "여러 PDF 파일을 하나로 합칩니다",
    url: "/tools/pdf-merge/",
  },
  twitter: {
    title: "PDF 병합 | AlphaK Tools",
    description: "여러 PDF 파일을 하나로 합칩니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
