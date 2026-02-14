import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RGB → HEX 변환",
  description: "RGB 값을 HEX 색상 코드로 변환합니다",
  alternates: { canonical: "/tools/rgb-to-hex/" },
  openGraph: {
    title: "RGB → HEX 변환",
    description: "RGB 값을 HEX 색상 코드로 변환합니다",
    url: "/tools/rgb-to-hex/",
  },
  twitter: {
    title: "RGB → HEX 변환 | AlphaK Tools",
    description: "RGB 값을 HEX 색상 코드로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
