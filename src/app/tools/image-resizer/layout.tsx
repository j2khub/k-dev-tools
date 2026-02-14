import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 리사이즈",
  description: "이미지 크기를 원하는 비율이나 픽셀로 조절합니다",
  alternates: { canonical: "/tools/image-resizer/" },
  openGraph: {
    title: "이미지 리사이즈",
    description: "이미지 크기를 원하는 비율이나 픽셀로 조절합니다",
    url: "/tools/image-resizer/",
  },
  twitter: {
    title: "이미지 리사이즈 | AlphaK Tools",
    description: "이미지 크기를 원하는 비율이나 픽셀로 조절합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
