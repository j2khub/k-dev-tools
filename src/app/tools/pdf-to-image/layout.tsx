import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF → 이미지",
  description: "PDF 파일의 각 페이지를 이미지로 변환합니다",
  alternates: { canonical: "/tools/pdf-to-image/" },
  openGraph: {
    title: "PDF → 이미지",
    description: "PDF 파일의 각 페이지를 이미지로 변환합니다",
    url: "/tools/pdf-to-image/",
  },
  twitter: {
    title: "PDF → 이미지 | AlphaK Tools",
    description: "PDF 파일의 각 페이지를 이미지로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
