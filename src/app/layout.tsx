import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Results",
  description: "Register football match results and track league standings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
