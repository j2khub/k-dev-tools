import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "단위 변환기",
  description: "길이, 무게, 온도, 속도 단위를 상호 변환합니다",
  alternates: { canonical: "/tools/unit-converter/" },
  openGraph: {
    title: "단위 변환기",
    description: "길이, 무게, 온도, 속도 단위를 상호 변환합니다",
    url: "/tools/unit-converter/",
  },
  twitter: {
    title: "단위 변환기 | AlphaK Tools",
    description: "길이, 무게, 온도, 속도 단위를 상호 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
