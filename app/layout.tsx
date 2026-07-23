import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "算法深渊 ALGO ABYSS",
  description: "在像素矿境里采集数据、训练模型，用真正运行的算法击败未知生物。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
