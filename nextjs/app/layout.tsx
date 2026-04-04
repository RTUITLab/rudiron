import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.scss";
import "./layout.scss";

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
          <Toaster position="bottom-center" toastOptions={{ style: { width: "100%", backgroundColor: "#2d2e37", color: "white", borderRadius: "10px", border: "1px solid #3d3e47", padding: "10px" } }} />
        </body>
      </html>
  );
}
