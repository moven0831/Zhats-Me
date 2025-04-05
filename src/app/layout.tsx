'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { createContext, useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Create context for sharing the selected event
export interface EventInfo {
  id: string;
  name: string;
}

export const EventContext = createContext<{
  selectedEvent: EventInfo;
  setSelectedEvent: (event: EventInfo) => void;
}>({
  selectedEvent: { id: "taipei-2025", name: "ETHGlobal Taipei 2025" },
  setSelectedEvent: () => {},
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // List of ETHGlobal events
  const events = [
    { id: "taipei-2025", name: "ETHGlobal Taipei 2025" },
    { id: "future-events", name: "Future ETHGlobal Events" },
  ];
  
  const [selectedEvent, setSelectedEvent] = useState<EventInfo>(events[0]);
  
  const handleEventChange = (eventId: string) => {
    const event = events.find(e => e.id === eventId) || events[0];
    setSelectedEvent(event);
  };

  return (
    <html lang="en">
      <head>
        <title>Zhat&apos;s Me | ETHGlobal Hackathon Ticket Verification</title>
        <meta name="description" content="Securely verify your identity to claim your ETHGlobal Hackathon ticket without revealing your ID document." />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <EventContext.Provider value={{ selectedEvent, setSelectedEvent: (event) => setSelectedEvent(event) }}>
          <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Zhat&apos;s Me
                </span>
              </div>
              <div className="hidden md:block relative">
                <div className="relative inline-block">
                  <select
                    value={selectedEvent.id}
                    onChange={(e) => handleEventChange(e.target.value)}
                    className="appearance-none cursor-pointer text-sm font-medium pl-3 pr-8 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
                  >
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-800 dark:text-blue-300">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-grow py-8 sm:py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              {children}
            </div>
          </main>
          <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ETHGlobal Hackathon Ticket Verification • Privacy-Preserving Identity Verification
              </p>
            </div>
          </footer>
        </EventContext.Provider>
      </body>
    </html>
  );
}
