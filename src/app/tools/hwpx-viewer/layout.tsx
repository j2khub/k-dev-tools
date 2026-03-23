import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HWPX 뷰어",
  description: "HWPX 파일의 텍스트, 표, 이미지를 추출하여 표시합니다",
  alternates: { canonical: "/tools/hwpx-viewer/" },
  openGraph: {
    title: "HWPX 뷰어",
    description: "HWPX 파일의 텍스트, 표, 이미지를 추출하여 표시합니다",
    url: "/tools/hwpx-viewer/",
  },
  twitter: {
    title: "HWPX 뷰어 | AlphaK Tools",
    description: "HWPX 파일의 텍스트, 표, 이미지를 추출하여 표시합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
