import { SerialPort } from "web-serial-polyfill";
import { ESPLoader, Transport } from "esptool-js";
import CryptoJS from "crypto-js";

export const useUploaderFirmware = (onLog?: (text: string) => void) => {
    const loaderFirmware = async (port: SerialPort, firmwareFile: File, onProgress?: (percent: number) => void) => {
        if (!port) throw new Error("Port is required");
        if (!firmwareFile) throw new Error("Firmware file is required")
        if (onLog) onLog("[Firmware] Закрываем порт...");

        if (port.readable || port.writable) {
            try {
                await port.close();
                await new Promise(res => setTimeout(res, 500));
            } catch  {}
        }

        const transport = new Transport(port, true);
        const loader = new ESPLoader({
            transport,
            baudrate: 115200,
            romBaudrate: 115200,
            terminal: onLog ? {
                    clean() {},
                    writeLine: onLog,
                    write: onLog
                } : undefined,
            debugLogging: false,
        });

        try {
            const chip = await loader.main();
            console.log(`[Firmware] Подключено к чипу: ${chip}`);

            const data = await firmwareFile.arrayBuffer();
            const binaryStr = Array.from(new Uint8Array(data))
                .map(b => String.fromCharCode(b))
                .join("");

            await loader.writeFlash({
                fileArray: [{ data: binaryStr, address: 0x1000 }],
                flashSize: "keep",
                eraseAll: false,
                flashMode: "dio",
                flashFreq: "40m",
                compress: true,
                reportProgress: (fileIndex, written, total) => {
                    const percent = Math.round((written / total) * 100);
                    if (onProgress) onProgress(percent);
                },
                calculateMD5Hash: image =>
                    CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)).toString(CryptoJS.enc.Hex),
            });

            await loader.after();
            await transport.disconnect();

            return { ok: true, message: "✅ Прошивка успешно установлена!" };
        } catch (error) {
            return { ok: false, message: "Ошибка прошивки", error }
        }
    };

    return { loaderFirmware };
};
