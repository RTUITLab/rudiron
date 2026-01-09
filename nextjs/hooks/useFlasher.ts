// useFlasher.ts
"use client";
import { useState, useCallback } from "react";
import { ESPLoader } from "esptool-js";

export function useFlasher() {
  const [device, setDevice] = useState<USBDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [progress, setProgress] = useState(0);

  const connectDevice = useCallback(async () => {
    try {
      const d = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x10c4 }, // SiLabs
          { vendorId: 0x1a86 }, // CH340
          { vendorId: 0x2341 }, // Arduino
        ],
      });

      await d.open();
      if (!d.configuration) await d.selectConfiguration(1);
      await d.claimInterface(0);

      setDevice(d);
      setIsConnected(true);
      console.log("✅ Устройство подключено", d.productName);
    } catch (e) {
      console.error("Ошибка подключения:", e);
    }
  }, []);

  const uploadBin = useCallback(
    async (binFile: File) => {
      if (!device) throw new Error("Нет подключенного устройства");

      const buffer = new Uint8Array(await binFile.arrayBuffer());

      // создаём loader с baudrate 115200
      const loader = new ESPLoader(device, { baudrate: 115200 });

      loader.on("progress", (p) => setProgress(Math.floor(p * 100)));

      try {
        await loader.connect();
        await loader.eraseFlash();
        await loader.flashData(buffer, 0x1000); // Стандартный адрес прошивки ESP32
        console.log("✅ Прошивка завершена");
      } catch (e) {
        console.error("Ошибка прошивки:", e);
      } finally {
        setProgress(0);
      }
    },
    [device]
  );

  return { device, isConnected, connectDevice, uploadBin, progress };
}
