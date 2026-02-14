import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 → Base64",
  description: "이미지 파일을 Base64 문자열로 변환합니다",
  alternates: { canonical: "/tools/image-to-base64/" },
  openGraph: {
    title: "이미지 → Base64",
    description: "이미지 파일을 Base64 문자열로 변환합니다",
    url: "/tools/image-to-base64/",
  },
  twitter: {
    title: "이미지 → Base64 | AlphaK Tools",
    description: "이미지 파일을 Base64 문자열로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
