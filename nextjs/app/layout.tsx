import type { Metadata } from "next";
import "@/styles/globals.scss";
import { Russo_One, Jersey_20, JetBrains_Mono } from "next/font/google";
import "./layout.scss";

const russo = Russo_One({ subsets: ["latin", "cyrillic"], weight: "400" });
const jersey = Jersey_20({ subsets: ["latin"], weight: "400" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: "400" });

export const metadata: Metadata = {
  title: "KidsCode",
  description: "NoCode-платформа для Интернета вещей",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo192.png",
  },
};


export default function RootLayout({children}: { children: React.ReactNode; }) {
  return (
      <html lang="ru">
        <head>
          <meta name="theme-color" content="#000000" />
        </head>
        <body>
          {children}
        </body>
      </html>
  );
}
