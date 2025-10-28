import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import { Outfit, JetBrains_Mono } from "next/font/google";
import QueryProv from "@/context/react-query-provider";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/context/auth-provider";
import Navbar from "@/components/shared/Navbar";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Neuro-Nest",
  description: "LMS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.className} ${jetbrainsMono.className}`}
      suppressHydrationWarning
    >
      <body>
        <QueryProv>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div>
                <div className="mx-20 min-h-screen flex flex-col">
                  <div className="border-b border-b-emerald-600 dark:border-b-emerald-300 py-2">
                    <Navbar />
                  </div>
                  {children}

                </div>
              </div>
              <Toaster position="top-center" />
            </AuthProvider>
          </ThemeProvider>
        </QueryProv>
      </body>
    </html>
  );
}
