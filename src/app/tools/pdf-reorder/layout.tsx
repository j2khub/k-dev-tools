import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 페이지 재정렬",
  description: "PDF 페이지 순서를 변경하거나 특정 페이지를 삭제합니다",
  alternates: { canonical: "/tools/pdf-reorder/" },
  openGraph: {
    title: "PDF 페이지 재정렬",
    description: "PDF 페이지 순서를 변경하거나 특정 페이지를 삭제합니다",
    url: "/tools/pdf-reorder/",
  },
  twitter: {
    title: "PDF 페이지 재정렬 | AlphaK Tools",
    description: "PDF 페이지 순서를 변경하거나 특정 페이지를 삭제합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
