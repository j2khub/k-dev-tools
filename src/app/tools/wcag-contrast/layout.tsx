import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WCAG 색상 대비 검사",
  description: "전경/배경 색상의 대비율과 접근성 기준 충족 여부를 확인합니다",
  alternates: { canonical: "/tools/wcag-contrast/" },
  openGraph: {
    title: "WCAG 색상 대비 검사",
    description: "전경/배경 색상의 대비율과 접근성 기준 충족 여부를 확인합니다",
    url: "/tools/wcag-contrast/",
  },
  twitter: {
    title: "WCAG 색상 대비 검사 | AlphaK Tools",
    description: "전경/배경 색상의 대비율과 접근성 기준 충족 여부를 확인합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
