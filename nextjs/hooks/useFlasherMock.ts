"use client";
import { useState } from "react";

export function useFlasherMock() {
  const [device, setDevice] = useState({ productName: "Mock ESP32" } as any);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(0);

  const connectDevice = async () => {
    console.log("✅ Мок: устройство подключено");
    setIsConnected(true);
  };

  const uploadBin = async (binFile: File) => {
    console.log("🔹 Мок: начинаем прошивку", binFile.name);
    for (let p = 0; p <= 100; p += 10) {
      setProgress(p);
      await new Promise(r => setTimeout(r, 100));
    }
    console.log("✅ Мок-прошивка завершена");
    setProgress(0);
  };

  return { device, isConnected, connectDevice, uploadBin, progress };
}