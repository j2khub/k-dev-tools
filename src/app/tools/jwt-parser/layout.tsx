import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT 파서",
  description: "JSON Web Token을 디코딩하여 헤더와 페이로드를 확인합니다",
  alternates: { canonical: "/tools/jwt-parser/" },
  openGraph: {
    title: "JWT 파서",
    description: "JSON Web Token을 디코딩하여 헤더와 페이로드를 확인합니다",
    url: "/tools/jwt-parser/",
  },
  twitter: {
    title: "JWT 파서 | AlphaK Tools",
    description: "JSON Web Token을 디코딩하여 헤더와 페이로드를 확인합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
