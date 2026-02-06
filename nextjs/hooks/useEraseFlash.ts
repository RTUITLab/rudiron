import { SerialPort } from "web-serial-polyfill";
import { ESPLoader, Transport } from "esptool-js";

export const useEraseFlash = (onLog?: (text: string) => void) => {
    const eraseFlash = async (port: SerialPort | null) => {
        if (!port) throw new Error("Port is required");
        if (onLog) onLog("[EraseFlash] Закрываем порт...");

        if (port.readable || port.writable) {
            try {
                await port.close();
                await new Promise(res => setTimeout(res, 500));
            } catch (e) {
                console.warn("[EraseFlash] Ошибка при закрытии порта:", e);
            }
        }

        const transport = new Transport(port, true);
        const loader = new ESPLoader({
            transport,
            baudrate: 115200,
            romBaudrate: 115200,
            terminal: onLog ? {
                clean() { },
                writeLine: onLog,
                write: onLog
            } : undefined,
        });

        try {
            await loader.main();
            await loader.eraseFlash();
            return { ok: true, message: "✅ Память успешно очищена" };
        } catch (error) {
            return { ok: false, message: `❌ Ошибка очистки: ${error}` };
        } finally {
            await transport.disconnect();
        }
    };

    return { eraseFlash };
};
