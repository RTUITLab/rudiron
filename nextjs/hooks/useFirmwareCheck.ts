import { SerialPort } from "web-serial-polyfill";
import { useCallback } from "react";

export const useFirmwareCheck = (port: SerialPort | null) => {
    const checkFirmware = useCallback(async () => {
        if (!port) {
            return { ok: false, message: "Порт не выбран" };
        }

        if (!port.writable) {
            return { ok: false, message: "Порт не открыт для записи" };
        }

        try {
            console.log("[FirmwareCheck] Проверка MicroPython...");
            const writer = port.writable.getWriter();
            const encoder = new TextEncoder();

            // Отправляем пустую строку, чтобы REPL дал приглашение ">>>"
            await writer.write(encoder.encode("\r\n"));
            await new Promise(r => setTimeout(r, 200));

            // Запрашиваем версию прошивки — MicroPython должен ответить
            await writer.write(encoder.encode("import sys\r\nprint(sys.version)\r\n"));
            await new Promise(r => setTimeout(r, 1000));

            writer.releaseLock();

            // 💡 Не читаем здесь ничего — readLoop сам выведет ответ в терминал
            return {
                ok: true,
                message: "Команда отправлена. Проверяйте терминал для ответа MicroPython.",
            };
        } catch (error) {
            console.error("[FirmwareCheck] Ошибка:", error);
            return {
                ok: false,
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }, [port]);

    return { checkFirmware };
};
