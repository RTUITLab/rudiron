import { useState } from "react";
import { SerialPort } from "web-serial-polyfill";

export const useSerialPort = () => {
    const [port, setPort] = useState<SerialPort | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = async () => {
        try {
            if (!("serial" in navigator)) {
                throw new Error("Web Serial API не поддерживается в этом браузере");
            }

            const nav = navigator as any;
            const selectedPort: SerialPort = await nav.serial.requestPort();

            if (!selectedPort.readable) {
                await selectedPort.open({ baudRate: 115200 });
            }

            setPort(selectedPort);
            setIsConnected(true);
            return { success: true, port: selectedPort };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    };

    const disconnect = async () => {
        if (!port) return;

        try {
            await port.close();
            setPort(null);
            setIsConnected(false);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    };

    const ensurePortOpen = async (port: SerialPort) => {
        if (!port.readable || !port.writable) {
            await port.open({ baudRate: 115200 });
        }
    };

    return {
        port,
        isConnected,
        connect,
        disconnect,
        ensurePortOpen
    };
};