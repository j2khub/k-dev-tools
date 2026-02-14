import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "진법 변환기",
  description: "2진수, 8진수, 10진수, 16진수를 상호 변환합니다",
  alternates: { canonical: "/tools/number-base/" },
  openGraph: {
    title: "진법 변환기",
    description: "2진수, 8진수, 10진수, 16진수를 상호 변환합니다",
    url: "/tools/number-base/",
  },
  twitter: {
    title: "진법 변환기 | AlphaK Tools",
    description: "2진수, 8진수, 10진수, 16진수를 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
