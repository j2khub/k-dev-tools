import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HEX → RGB 변환",
  description: "HEX 색상 코드를 RGB 값으로 변환합니다",
  alternates: { canonical: "/tools/hex-to-rgb/" },
  openGraph: {
    title: "HEX → RGB 변환",
    description: "HEX 색상 코드를 RGB 값으로 변환합니다",
    url: "/tools/hex-to-rgb/",
  },
  twitter: {
    title: "HEX → RGB 변환 | AlphaK Tools",
    description: "HEX 색상 코드를 RGB 값으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
