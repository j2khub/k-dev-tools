import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex 테스터",
  description: "정규식을 실시간으로 테스트하고 매칭 결과를 확인합니다",
  alternates: { canonical: "/tools/regex-tester/" },
  openGraph: {
    title: "Regex 테스터",
    description: "정규식을 실시간으로 테스트하고 매칭 결과를 확인합니다",
    url: "/tools/regex-tester/",
  },
  twitter: {
    title: "Regex 테스터 | AlphaK Tools",
    description: "정규식을 실시간으로 테스트하고 매칭 결과를 확인합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
