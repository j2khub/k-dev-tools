import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 → 이미지",
  description: "Base64 문자열을 이미지로 변환하여 미리보기합니다",
  alternates: { canonical: "/tools/base64-to-image/" },
  openGraph: {
    title: "Base64 → 이미지",
    description: "Base64 문자열을 이미지로 변환하여 미리보기합니다",
    url: "/tools/base64-to-image/",
  },
  twitter: {
    title: "Base64 → 이미지 | AlphaK Tools",
    description: "Base64 문자열을 이미지로 변환하여 미리보기합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
