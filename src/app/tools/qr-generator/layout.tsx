import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR 코드 생성기",
  description: "텍스트나 URL을 QR 코드로 생성합니다",
  alternates: { canonical: "/tools/qr-generator/" },
  openGraph: {
    title: "QR 코드 생성기",
    description: "텍스트나 URL을 QR 코드로 생성합니다",
    url: "/tools/qr-generator/",
  },
  twitter: {
    title: "QR 코드 생성기 | AlphaK Tools",
    description: "텍스트나 URL을 QR 코드로 생성합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
