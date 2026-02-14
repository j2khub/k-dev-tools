import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "색상 피커/팔레트",
  description: "색상을 선택하고 다양한 형식으로 변환하며 팔레트를 생성합니다",
  alternates: { canonical: "/tools/color-picker/" },
  openGraph: {
    title: "색상 피커/팔레트",
    description: "색상을 선택하고 다양한 형식으로 변환하며 팔레트를 생성합니다",
    url: "/tools/color-picker/",
  },
  twitter: {
    title: "색상 피커/팔레트 | AlphaK Tools",
    description: "색상을 선택하고 다양한 형식으로 변환하며 팔레트를 생성합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
