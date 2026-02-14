import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서브넷 계산기",
  description: "IP 주소와 CIDR 표기법으로 서브넷 정보를 계산합니다",
  alternates: { canonical: "/tools/subnet-calc/" },
  openGraph: {
    title: "서브넷 계산기",
    description: "IP 주소와 CIDR 표기법으로 서브넷 정보를 계산합니다",
    url: "/tools/subnet-calc/",
  },
  twitter: {
    title: "서브넷 계산기 | AlphaK Tools",
    description: "IP 주소와 CIDR 표기법으로 서브넷 정보를 계산합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
