import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "랜덤 문자열 생성기",
  description: "지정한 길이와 옵션으로 랜덤 문자열을 생성합니다",
  alternates: { canonical: "/tools/random-string/" },
  openGraph: {
    title: "랜덤 문자열 생성기",
    description: "지정한 길이와 옵션으로 랜덤 문자열을 생성합니다",
    url: "/tools/random-string/",
  },
  twitter: {
    title: "랜덤 문자열 생성기 | AlphaK Tools",
    description: "지정한 길이와 옵션으로 랜덤 문자열을 생성합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
