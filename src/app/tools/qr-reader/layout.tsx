import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR 코드 리더",
  description: "이미지 업로드 또는 카메라로 QR 코드를 스캔합니다",
  alternates: { canonical: "/tools/qr-reader/" },
  openGraph: {
    title: "QR 코드 리더",
    description: "이미지 업로드 또는 카메라로 QR 코드를 스캔합니다",
    url: "/tools/qr-reader/",
  },
  twitter: {
    title: "QR 코드 리더 | AlphaK Tools",
    description: "이미지 업로드 또는 카메라로 QR 코드를 스캔합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
