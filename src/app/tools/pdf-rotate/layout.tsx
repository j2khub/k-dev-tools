import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF 페이지 회전",
  description: "PDF 페이지를 원하는 각도로 회전합니다",
  alternates: { canonical: "/tools/pdf-rotate/" },
  openGraph: {
    title: "PDF 페이지 회전",
    description: "PDF 페이지를 원하는 각도로 회전합니다",
    url: "/tools/pdf-rotate/",
  },
  twitter: {
    title: "PDF 페이지 회전 | AlphaK Tools",
    description: "PDF 페이지를 원하는 각도로 회전합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
