import { useState, useEffect, useRef } from "react";
import { SerialPort } from "web-serial-polyfill";

export const useTerminal = (port: SerialPort | null) => {
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [inputCommand, setInputCommand] = useState("");
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

    const stopReadLoop = async () => {
        if (readerRef.current) {
            try {
                await readerRef.current.cancel();
                readerRef.current.releaseLock();
                readerRef.current = null;
            } catch (e) {
                console.warn("Ошибка при остановке readLoop:", e);
            }
        }
    };

    const sendCommand = async (command: string) => {
        if (!port || !command.trim()) return;

        const writer = port.writable?.getWriter();
        if (!writer) return;

        const encoder = new TextEncoder();
        const cmd = command.trim() + "\r\n";
        await writer.write(encoder.encode(cmd));
        writer.releaseLock();

        setTerminalLogs(prev => [...prev, `<span style="color:#999">> ${command}</span>`]);
        setInputCommand("");
    };

    const addLog = (message: string) => {
        setTerminalLogs(prev => [...prev, message]);
    };

    useEffect(() => {
        if (!port) return;

        let isActive = true;
        const decoder = new TextDecoder();
        let buffer = "";
        let flushTimeout: NodeJS.Timeout;

        const flushBuffer = () => {
            if (buffer.trim() !== "") {
                setTerminalLogs(prev => [...prev, buffer]);
                buffer = "";
            }
        };

        const readLoop = async () => {
            if (!port.readable) return;
            const reader = port.readable.getReader();
            readerRef.current = reader;

            while (isActive) {
                try {
                    const { value, done } = await reader.read();
                    if (done || !isActive) break;
                    if (value) {
                        const text = decoder.decode(value);
                        buffer += text;

                        if (text.includes("\n")) {
                            const lines = buffer.split(/\r?\n/);
                            buffer = lines.pop() || "";
                            setTerminalLogs(prev => [...prev, ...lines]);
                        }

                        clearTimeout(flushTimeout);
                        flushTimeout = setTimeout(flushBuffer, 200);
                    }
                } catch (err) {
                    console.warn("[Terminal] Ошибка чтения:", err);
                    break;
                }
            }

            flushBuffer();
            reader.releaseLock();
        };

        readLoop();

        return () => {
            isActive = false;
            clearTimeout(flushTimeout);
            if (readerRef.current) {
                try {
                    readerRef.current.cancel();
                } catch {}
            }
        };
    }, [port]);

    useEffect(() => {
        const term = document.getElementById("terminal");
        if (term) term.scrollTop = term.scrollHeight;
    }, [terminalLogs]);

    return {
        terminalLogs,
        inputCommand,
        setInputCommand,
        sendCommand,
        addLog,
        stopReadLoop
    };
};