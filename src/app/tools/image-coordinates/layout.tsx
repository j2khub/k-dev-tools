import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 좌표 추출",
  description: "이미지에서 클릭 또는 드래그로 좌표를 추출하고 JSON, CSV, CSS 형식으로 내보냅니다",
  alternates: { canonical: "/tools/image-coordinates/" },
  openGraph: {
    title: "이미지 좌표 추출",
    description: "이미지에서 클릭 또는 드래그로 좌표를 추출하고 JSON, CSV, CSS 형식으로 내보냅니다",
    url: "/tools/image-coordinates/",
  },
  twitter: {
    title: "이미지 좌표 추출 | AlphaK Tools",
    description: "이미지에서 클릭 또는 드래그로 좌표를 추출하고 JSON, CSV, CSS 형식으로 내보냅니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
