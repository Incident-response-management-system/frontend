import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "IRMS · Incident Response Management System",
  description: "Emergency reporting and civic response coordination platform for Redemption Camp and Ogun State, Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="bottom-right" richColors />
        {children}
      </body>
    </html>
  );
}
