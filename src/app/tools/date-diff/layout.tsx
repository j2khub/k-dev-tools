import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "날짜 차이 계산기",
  description: "두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다",
  alternates: { canonical: "/tools/date-diff/" },
  openGraph: {
    title: "날짜 차이 계산기",
    description: "두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다",
    url: "/tools/date-diff/",
  },
  twitter: {
    title: "날짜 차이 계산기 | AlphaK Tools",
    description: "두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
