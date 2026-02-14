import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAML → JSON",
  description: "YAML 설정 파일을 JSON으로 변환합니다",
  alternates: { canonical: "/tools/yaml-to-json/" },
  openGraph: {
    title: "YAML → JSON",
    description: "YAML 설정 파일을 JSON으로 변환합니다",
    url: "/tools/yaml-to-json/",
  },
  twitter: {
    title: "YAML → JSON | AlphaK Tools",
    description: "YAML 설정 파일을 JSON으로 변환합니다",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
