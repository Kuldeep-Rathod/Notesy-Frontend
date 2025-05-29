import { Toaster } from '@/components/ui/sonner';
import ClientOnlyWrapper from '@/voice-assistant/components/ClientOnlyWrapper';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from './provider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Notesy',
    icons: {
        icon: '/favicon.svg',
    },
    description:
        'Notesy – A voice-controlled app to create and organize notes with text, images, and labels',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ReduxProvider>
                    {' '}
                    <ClientOnlyWrapper />
                    {children}
                    <Toaster />
                </ReduxProvider>
            </body>
        </html>
    );
}
