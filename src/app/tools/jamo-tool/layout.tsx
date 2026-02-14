import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "한글 자모 분리/조합기",
  description: "한글의 자음과 모음을 분리하거나 조합합니다",
  alternates: { canonical: "/tools/jamo-tool/" },
  openGraph: {
    title: "한글 자모 분리/조합기",
    description: "한글의 자음과 모음을 분리하거나 조합합니다",
    url: "/tools/jamo-tool/",
  },
  twitter: {
    title: "한글 자모 분리/조합기 | AlphaK Tools",
    description: "한글의 자음과 모음을 분리하거나 조합합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
