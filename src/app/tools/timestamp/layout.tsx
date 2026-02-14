import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "타임스탬프 ↔ 날짜",
  description: "Unix 타임스탬프와 날짜/시간을 상호 변환합니다",
  alternates: { canonical: "/tools/timestamp/" },
  openGraph: {
    title: "타임스탬프 ↔ 날짜",
    description: "Unix 타임스탬프와 날짜/시간을 상호 변환합니다",
    url: "/tools/timestamp/",
  },
  twitter: {
    title: "타임스탬프 ↔ 날짜 | AlphaK Tools",
    description: "Unix 타임스탬프와 날짜/시간을 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
