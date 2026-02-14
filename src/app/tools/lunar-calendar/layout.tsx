import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "음력 ↔ 양력 변환기",
  description: "음력 날짜와 양력 날짜를 상호 변환합니다",
  alternates: { canonical: "/tools/lunar-calendar/" },
  openGraph: {
    title: "음력 ↔ 양력 변환기",
    description: "음력 날짜와 양력 날짜를 상호 변환합니다",
    url: "/tools/lunar-calendar/",
  },
  twitter: {
    title: "음력 ↔ 양력 변환기 | AlphaK Tools",
    description: "음력 날짜와 양력 날짜를 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
