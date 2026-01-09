// src/contexts/LogContext.tsx
import React, { createContext, useCallback, useState } from "react";

export interface LogContextValue {
  entries: string[];
  addLog: (msg: string) => void;
  clearLog: () => void;
}

export const LogContext = createContext<LogContextValue | undefined>(undefined);

export const LogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    setEntries(prev => [...prev, msg]);
  }, []);

  const clearLog = useCallback(() => {
    setEntries([]);
  }, []);

  return (
    <LogContext.Provider value={{ entries, addLog, clearLog }}>
      {children}
    </LogContext.Provider>
  );
};
