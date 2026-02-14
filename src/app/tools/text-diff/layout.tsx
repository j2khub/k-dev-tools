import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "텍스트 Diff 비교",
  description: "두 텍스트의 차이점을 비교하여 강조 표시합니다",
  alternates: { canonical: "/tools/text-diff/" },
  openGraph: {
    title: "텍스트 Diff 비교",
    description: "두 텍스트의 차이점을 비교하여 강조 표시합니다",
    url: "/tools/text-diff/",
  },
  twitter: {
    title: "텍스트 Diff 비교 | AlphaK Tools",
    description: "두 텍스트의 차이점을 비교하여 강조 표시합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
