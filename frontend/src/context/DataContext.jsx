import { createContext, useContext, useState, useEffect, useCallback } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [isOnline, setIsOnline] = useState(false);
  const [dbStatus, setDbStatus] = useState("checking");

  const checkHealth = useCallback(async () => {
    try {
      // Use a timeout to avoid long-hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/health", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        setIsOnline(true);
        setDbStatus("connected");
      } else {
        setIsOnline(false);
        setDbStatus("error");
      }
    } catch (error) {
      setIsOnline(false);
      setDbStatus("error");
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkHealth();

    // Poll every 10 seconds to detect when backend comes back online
    const interval = setInterval(checkHealth, 10000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <DataContext.Provider value={{ isOnline, dbStatus, checkHealth }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

