import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/hooks/use-theme";
import { ThemedToaster } from "@/components/ThemedToaster";

export const metadata: Metadata = {
  title: "IRMS · Incident Response Management System",
  description: "Emergency reporting and civic response coordination platform for Redemption Camp and Ogun State, Nigeria.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom (accessibility) but ensure mobile renders at device width
  viewportFit: "cover",
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
      suppressHydrationWarning
    >
      <head>
        {/* Set theme class before first paint to prevent flash-of-wrong-theme */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ThemedToaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
