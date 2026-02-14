import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HAR 파일 뷰어",
  description: "HAR 파일을 업로드하여 HTTP 요청/응답을 분석합니다",
  alternates: { canonical: "/tools/har-viewer/" },
  openGraph: {
    title: "HAR 파일 뷰어",
    description: "HAR 파일을 업로드하여 HTTP 요청/응답을 분석합니다",
    url: "/tools/har-viewer/",
  },
  twitter: {
    title: "HAR 파일 뷰어 | AlphaK Tools",
    description: "HAR 파일을 업로드하여 HTTP 요청/응답을 분석합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
