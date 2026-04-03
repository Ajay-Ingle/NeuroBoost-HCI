import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PerformanceProvider } from "./lib/PerformanceContext";
import { AuthProvider } from "./lib/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "NeuroBoost - Adaptive Cognitive Reflex Game",
    description: "A Gamified Adaptive Interface for Cognitive Reflex and Attention Training",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="light">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.variable} bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased`}>
                <AuthProvider>
                    <PerformanceProvider>
                        {children}
                    </PerformanceProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
