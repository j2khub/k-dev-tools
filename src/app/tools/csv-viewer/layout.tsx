import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV 파일 뷰어",
  description: "CSV 파일을 업로드하여 테이블로 보고 필터링합니다",
  alternates: { canonical: "/tools/csv-viewer/" },
  openGraph: {
    title: "CSV 파일 뷰어",
    description: "CSV 파일을 업로드하여 테이블로 보고 필터링합니다",
    url: "/tools/csv-viewer/",
  },
  twitter: {
    title: "CSV 파일 뷰어 | AlphaK Tools",
    description: "CSV 파일을 업로드하여 테이블로 보고 필터링합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
