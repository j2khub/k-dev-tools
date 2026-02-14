import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 분할",
  description: "PDF 파일을 원하는 페이지 범위로 분할합니다",
  alternates: { canonical: "/tools/pdf-split/" },
  openGraph: {
    title: "PDF 분할",
    description: "PDF 파일을 원하는 페이지 범위로 분할합니다",
    url: "/tools/pdf-split/",
  },
  twitter: {
    title: "PDF 분할 | AlphaK Tools",
    description: "PDF 파일을 원하는 페이지 범위로 분할합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
