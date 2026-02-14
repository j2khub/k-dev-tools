import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "파일 크기 계산기",
  description: "총 파일 용량 및 이미지/동영상 저장 공간을 계산합니다",
  alternates: { canonical: "/tools/file-size-calc/" },
  openGraph: {
    title: "파일 크기 계산기",
    description: "총 파일 용량 및 이미지/동영상 저장 공간을 계산합니다",
    url: "/tools/file-size-calc/",
  },
  twitter: {
    title: "파일 크기 계산기 | AlphaK Tools",
    description: "총 파일 용량 및 이미지/동영상 저장 공간을 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
