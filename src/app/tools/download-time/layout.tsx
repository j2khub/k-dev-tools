import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "다운로드 시간 계산기",
  description: "파일 크기와 다운로드 속도를 입력하여 예상 다운로드 시간을 계산합니다",
  alternates: { canonical: "/tools/download-time/" },
  openGraph: {
    title: "다운로드 시간 계산기",
    description: "파일 크기와 다운로드 속도를 입력하여 예상 다운로드 시간을 계산합니다",
    url: "/tools/download-time/",
  },
  twitter: {
    title: "다운로드 시간 계산기 | AlphaK Tools",
    description: "파일 크기와 다운로드 속도를 입력하여 예상 다운로드 시간을 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
