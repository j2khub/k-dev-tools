import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 블러",
  description: "이미지의 원하는 영역을 드래그하여 블러(모자이크) 처리합니다",
  alternates: { canonical: "/tools/image-blur/" },
  openGraph: {
    title: "이미지 블러",
    description: "이미지의 원하는 영역을 드래그하여 블러(모자이크) 처리합니다",
    url: "/tools/image-blur/",
  },
  twitter: {
    title: "이미지 블러 | AlphaK Tools",
    description: "이미지의 원하는 영역을 드래그하여 블러(모자이크) 처리합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
