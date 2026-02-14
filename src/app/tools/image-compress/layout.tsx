import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이미지 압축",
  description: "이미지 용량을 줄입니다. 품질과 최대 폭을 조절할 수 있습니다",
  alternates: { canonical: "/tools/image-compress/" },
  openGraph: {
    title: "이미지 압축",
    description: "이미지 용량을 줄입니다. 품질과 최대 폭을 조절할 수 있습니다",
    url: "/tools/image-compress/",
  },
  twitter: {
    title: "이미지 압축 | AlphaK Tools",
    description: "이미지 용량을 줄입니다. 품질과 최대 폭을 조절할 수 있습니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
