import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "데이터 용량 변환기",
  description: "데이터 용량 단위를 상호 변환합니다 (B, KB, MB, GB, TB, PB)",
  alternates: { canonical: "/tools/data-unit/" },
  openGraph: {
    title: "데이터 용량 변환기",
    description: "데이터 용량 단위를 상호 변환합니다 (B, KB, MB, GB, TB, PB)",
    url: "/tools/data-unit/",
  },
  twitter: {
    title: "데이터 용량 변환기 | AlphaK Tools",
    description: "데이터 용량 단위를 상호 변환합니다 (B, KB, MB, GB, TB, PB)",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
