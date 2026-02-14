import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공휴일 달력",
  description:
    "한국 공휴일, 대체공휴일, 임시공휴일 정보를 달력으로 확인하세요.",
  alternates: { canonical: "/calendar/" },
  openGraph: {
    title: "공휴일 달력",
    description: "한국 공휴일, 대체공휴일, 임시공휴일 정보",
    url: "/calendar",
  },
  twitter: {
    title: "공휴일 달력 | AlphaK Tools",
    description: "한국 공휴일, 대체공휴일, 임시공휴일 정보",
  },
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
