'use client';

import { createContext } from "react";

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