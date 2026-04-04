"use client";
import React, {useState, useContext, useEffect, useRef} from "react";
import generatorCode from "@/utils/generatorCode";
import CodeContext, { CodeType } from "@/context/code";
import Style from "./FlasherPanel.module.scss";
import {SerialPort} from "web-serial-polyfill";
import {useUploaderFirmware} from "@/hooks/useUploaderFirmware";
import {useEraseFlash} from "@/hooks/useEraseFlash";
import {useFirmwareCheck} from "@/hooks/useFirmwareCheck";
import SimpleCode from "@/components/SimpleCode";

// Тип для логов терминала
interface TerminalLog {
    text: string;
    type?: 'command' | 'flash' | 'erase' | 'code' | 'error' | 'success';
}

export default function FlasherPanel() {
    const [formattedCode, setFormattedCode] = useState("");
    const [binFile, setBinFile] = useState<File | null>(null);
    const { value: codeState } = useContext(CodeContext);
    const [port, setPort] = useState<SerialPort | null>(null);
    const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
    const [result, setResult] = useState<string>("");
    const [isFlashing, setIsFlashing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
    const [inputCommand, setInputCommand] = useState("");
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { loaderFirmware } = useUploaderFirmware((line) => {
        setTerminalLogs(prev => [...prev, { text: `[FLASH] ${line}`, type: 'flash' }]);
    });

    const { eraseFlash } = useEraseFlash((line) => {
        setTerminalLogs(prev => [...prev, { text: `[ERASE] ${line}`, type: 'erase' }]);
    });
    const { checkFirmware } = useFirmwareCheck(port);

    useEffect(() => {
        const loadDefaultFirmware = async () => {
            try {
                const response = await fetch('/ESP32_GENERIC-20251209-v1.27.0.bin');

                if (!response.ok) {
                    throw new Error(`Не удалось загрузить файл: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();

                const file = new File(
                    [arrayBuffer],
                    'ESP32_GENERIC-20251209-v1.27.0.bin',
                    { type: 'application/octet-stream' }
                );

                setFirmwareFile(file);

                setBinFile(file);

                setResult(`Автоматически выбран файл: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
                setTerminalLogs(prev => [...prev, { text: `✅ Автоматически выбран файл: ${file.name}`, type: 'success' }]);
            } catch (error) {
                console.error('[UI] Ошибка загрузки файла по умолчанию:', error);
                setResult('Не удалось загрузить example.bin из папки public');
                setTerminalLogs(prev => [...prev, { text: `❌ Ошибка загрузки файла: ${error}`, type: 'error' }]);
            }
        };

        loadDefaultFirmware();
    }, []);

    const handleConnect = async () => {
        try {
            if (!("serial" in navigator)) {
                setResult("Web Serial API не поддерживается в этом браузере");
                setTerminalLogs(prev => [...prev, { text: "❌ Web Serial API не поддерживается в этом браузере", type: 'error' }]);
                return;
            }

            const code = generateCodeFromBlocks();
            setFormattedCode(code);
            const nav = navigator as { serial: { requestPort(): Promise<SerialPort> } };
            const selectedPort: SerialPort = await nav.serial.requestPort();
            if (!selectedPort) return;

            if (!selectedPort.readable) {
                await selectedPort.open({ baudRate: 115200 });
            }

            setPort(selectedPort);
            setResult("Порт подключен. Теперь выберите файл прошивки.");
            setTerminalLogs(prev => [...prev, { text: "🟢 Порт подключен", type: 'success' }]);
        } catch (error) {
            console.error("[UI] Ошибка подключения к порту:", error);
            const errorMsg = `Ошибка подключения: ${error instanceof Error ? error.message : String(error)}`;
            setResult(errorMsg);
            setTerminalLogs(prev => [...prev, { text: `❌ ${errorMsg}`, type: 'error' }]);
        }
    };

    const stopReadLoop = async () => {
        if (readerRef.current) {
            try {
                await readerRef.current.cancel();
                readerRef.current.releaseLock();
                readerRef.current = null;
            } catch {
            }
        }
    };

    const handleFirmwareCheck = async () => {
        if (!port) {
            setResult("Сначала выберите порт");
            setTerminalLogs(prev => [...prev, { text: "❌ Сначала выберите порт", type: 'error' }]);
            return;
        }

        try {
            const result = await checkFirmware();
            setResult(result.message);
            setTerminalLogs(prev => [...prev, { text: `🔍 ${result.message}`, type: result.ok ? 'success' : 'error' }]);
        } catch (error) {
            console.log(error);
            setTerminalLogs(prev => [...prev, { text: `❌ Ошибка проверки: ${error}`, type: 'error' }]);
        }
    }

    // Прошивка MicroPython
    const handleUploadFirmware = async () => {
        if (!port) {
            setResult("Сначала выберите порт");
            setTerminalLogs(prev => [...prev, { text: "❌ Сначала выберите порт", type: 'error' }]);
            return;
        }
        if (!firmwareFile) {
            setResult("Сначала выберите файл прошивки");
            setTerminalLogs(prev => [...prev, { text: "❌ Сначала выберите файл прошивки", type: 'error' }]);
            return;
        }

        setIsFlashing(true);
        setResult("Начинается прошивка...");
        setTerminalLogs(prev => [...prev, { text: "🚀 Начинается прошивка...", type: 'flash' }]);

        try {
            await stopReadLoop();
            const result = await loaderFirmware(port, firmwareFile, (percent) => {
                setProgress(percent);
            });
            setResult(result.message);
            setTerminalLogs(prev => [...prev, { text: `✅ ${result.message}`, type: 'success' }]);

            await ensurePortOpen(port);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error("Ошибка прошивки:", err);
            const errorMsg = `Ошибка прошивки: ${err instanceof Error ? err.message : String(err)}`;
            setResult(errorMsg);
            setTerminalLogs(prev => [...prev, { text: `❌ ${errorMsg}`, type: 'error' }]);
        } finally {
            setIsFlashing(false);
        }
    };

    // Отключение от порта вручную
    const handleDisconnect = async () => {
        if (!port) return;
        try {
            await port.close();
            setPort(null);
            setResult("Порт отключен");
            setTerminalLogs(prev => [...prev, { text: "🔴 Порт отключен", type: 'command' }]);
        } catch (err) {
            console.error("[UI] Ошибка закрытия порта:", err);
            const errorMsg = `Ошибка закрытия порта: ${err instanceof Error ? err.message : String(err)}`;
            setResult(errorMsg);
            setTerminalLogs(prev => [...prev, { text: `❌ ${errorMsg}`, type: 'error' }]);
        }
    };

    const handleEraseFlash = async () => {
        if (!port) {
            setTerminalLogs(prev => [...prev, { text: "❌ Сначала выберите порт", type: 'error' }]);
            return;
        }

        try {
            setTerminalLogs(prev => [...prev, { text: "🧹 Очистка памяти...", type: 'erase' }]);
            await stopReadLoop();
            const result = await eraseFlash(port);
            setResult(result.message);
            setTerminalLogs(prev => [...prev, { text: `✅ ${result.message}`, type: 'success' }]);

            await ensurePortOpen(port);
        } catch (error) {
            console.log(error);
            setTerminalLogs(prev => [...prev, { text: `❌ Ошибка очистки: ${error}`, type: 'error' }]);
        }
    }

    const handleSendCommand = async () => {
        if (!port || !inputCommand.trim()) {
            setTerminalLogs(prev => [...prev, { text: "❌ Порт не подключен или команда пуста", type: 'error' }]);
            return;
        }

        const writer = port.writable?.getWriter();
        if (!writer) {
            setTerminalLogs(prev => [...prev, { text: "❌ Порт не готов к записи", type: 'error' }]);
            return;
        }

        const encoder = new TextEncoder();
        const cmd = inputCommand.trim() + "\r\n";
        
        try {
            await writer.write(encoder.encode(cmd));
            writer.releaseLock();

            // Добавляем команду в лог
            setTerminalLogs(prev => [...prev, { 
                text: inputCommand, 
                type: 'command' 
            }]);
            
            setInputCommand("");
        } catch (error) {
            writer.releaseLock();
            setTerminalLogs(prev => [...prev, { 
                text: `❌ Ошибка отправки команды: ${error}`, 
                type: 'error' 
            }]);
        }
    };

    const ensurePortOpen = async (p: SerialPort) => {
        if (!p.readable || !p.writable) {
            await p.open({ baudRate: 115200 });
        }
    };

    // Отправка кода
    const sendCodeToDevice = async () => {
        if (!port) {
            setResult("Сначала подключите порт");
            setTerminalLogs(prev => [...prev, { text: "❌ Сначала подключите порт", type: 'error' }]);
            return;
        }

        if (!formattedCode.trim()) {
            setResult("Нет кода для отправки");
            setTerminalLogs(prev => [...prev, { text: "❌ Нет кода для отправки", type: 'error' }]);
            return;
        }

        const log = (msg: string) =>
            setTerminalLogs(prev => [...prev, { text: `[CODE] ${msg}`, type: 'code' }]);

        try {
            log("🚀 Начинаем отправку кода...");
            
            const encoder = new TextEncoder();

            const writer = port.writable?.getWriter();
            if (!writer) {
                log("❌ Порт не готов к записи");
                return;
            }

            // Отправка Ctrl+C для остановки текущего выполнения
            log("Отправка Ctrl+C...");
            await writer.write(encoder.encode('\r\x03\x03'));
            await new Promise(r => setTimeout(r, 100));
            
            // Вход в raw REPL режим
            log("Вход в raw REPL режим (Ctrl+A)...");
            await writer.write(encoder.encode('\r\x01'));
            await new Promise(r => setTimeout(r, 100));

            // Отправка кода построчно
            const lines = formattedCode.split("\n");
            log(`Отправка ${lines.length} строк кода...`);
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                await writer.write(encoder.encode(line + "\r\n"));
                log(`→ ${line}`);
                await new Promise(r => setTimeout(r, 10));
            }

            // Выполнение (Ctrl+D)
            log("Выполнение кода (Ctrl+D)...");
            await writer.write(encoder.encode('\x04'));
            await new Promise(r => setTimeout(r, 1500));

            // Выход из raw REPL (Ctrl+B)
            log("Выход из raw REPL (Ctrl+B)...");
            await writer.write(encoder.encode('\r\x02'));
            writer.releaseLock();

            setResult("Код успешно отправлен и выполнен");
            log("✅ Код успешно отправлен и выполнен");

        } catch (error) {
            console.error("Ошибка при отправке кода:", error);
            const errorMsg = `Ошибка отправки: ${error instanceof Error ? error.message : String(error)}`;
            setResult(errorMsg);
            setTerminalLogs(prev => [...prev, { text: `❌ ${errorMsg}`, type: 'error' }]);
        }
    };

    const generateCodeFromBlocks = () => {
        if (!codeState || codeState.length === 0) return "";
        const childIds = new Set<number>();
        codeState.forEach((item: CodeType) =>
            item.children.forEach((child: CodeType) => childIds.add(child.id))
        );
        const roots = codeState.filter((i: CodeType) => !childIds.has(i.id));
        const rawCode = roots.map((i: CodeType) => i.code).join("%n%%n%");
        return generatorCode(rawCode);
    };

    useEffect(() => {
        if (!port) return;

        let isActive = true;
        const decoder = new TextDecoder();
        let buffer = "";
        let flushTimeout: NodeJS.Timeout;

        const flushBuffer = () => {
            if (buffer.trim() !== "") {
                setTerminalLogs(prev => [...prev, { text: buffer, type: undefined }]);
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

                        // Если пришёл перевод строки → отправляем в лог
                        if (text.includes("\n")) {
                            const lines = buffer.split(/\r?\n/);
                            buffer = lines.pop() || "";
                            setTerminalLogs(prev => [...prev, ...lines.map(line => ({ text: line, type: undefined }))]);
                        }

                        // Если строка не завершена, но прошло >200мс — сбрасываем
                        clearTimeout(flushTimeout);
                        flushTimeout = setTimeout(flushBuffer, 200);
                    }
                } catch (err) {
                    console.warn("[Terminal] Ошибка чтения:", err);
                    break;
                }
            }

            // в конце — сбросим буфер
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

    // Функция для получения цвета в зависимости от типа сообщения
    const getLogColor = (type?: string): string => {
        switch (type) {
            case 'command': return '#999';
            case 'flash': return '#ff9800';
            case 'erase': return '#f44336';
            case 'code': return '#4caf50';
            case 'error': return '#ff4444';
            case 'success': return '#00c853';
            default: return 'white';
        }
    };

    return (
        <div className={Style.panel}>
            <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <label style={{ fontWeight: "bold", textAlign: "start", marginLeft: "5px", marginBottom: "10px" }}>
                        Отформатированный код
                    </label>
                </div>

                <SimpleCode code={formattedCode} language={"python"} />
            </div>

            <span style={{ fontSize: "16px", color: "#A7A7A7", fontWeight: "500", marginBottom: "10px", textAlign: "start", display: "block" }}>
            </span>

            <div style={{ margin: 10, justifyContent: "start", paddingBottom: "20px"}}>
                <div style={{display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center"}}>
                    {
                        port ?
                            <>
                                <span style={{fontSize: "16px", color: "#A7A7A7", fontWeight: "bold"}}>🟢 Подключено</span>
                                <button onClick={handleDisconnect} className={Style.button} style={{width: "50%"}} disabled={isFlashing}>
                                    Отключить
                                </button>
                            </>
                            :
                            <>
                                <>
                                    <span style={{fontSize: "16px", color: "#A7A7A7", fontWeight: "bold"}}>🔴 Отключено</span>
                                    <button onClick={handleConnect} className={Style.button} style={{width: "50%"}}>
                                        Подключить
                                    </button>
                                </>
                            </>
                    }
                </div>
            </div>

                {isFlashing &&
                    <div className={Style.progressSection}>
                        <div className={Style.progressHeader}>
                            <span className={Style.progressLabel}>Прогресс прошивки:</span>
                            <span className={Style.progressValue}>{progress}%</span>
                        </div>

                        <div className={Style.customProgress}>
                            <div className={Style.progressFill} id={"progressPercent"} style={{ width: `${progress}%` }} />
                            <div className={Style.progressStripes} />
                        </div>
                    </div>
                }

            <div className={Style.controls}>
                <button className={Style.button} disabled={!port || !firmwareFile || isFlashing} onClick={handleUploadFirmware}>
                    {isFlashing ? "Идет прошивка..." : "Загрузить прошивку"}
                </button>

                <button onClick={handleFirmwareCheck} disabled={!port || isFlashing} className={Style.button}>
                    Проверка прошивки
                </button>

                <button onClick={handleEraseFlash} disabled={!port || isFlashing} className={Style.button}>
                    Очистить память
                </button>

                <button onClick={sendCodeToDevice} disabled={!port || isFlashing} className={Style.button}>
                    Загрузка кода на устройство
                </button>
            </div>

            <div>
                <h2 style={{ textAlign: "start", marginBottom: "16px" }}>Терминал</h2>
                <div
                    className={Style.terminal}
                    id="terminal"
                >
                    {terminalLogs.map((log, i) => (
                        <div key={i} style={{ color: getLogColor(log.type) }}>
                            {log.type === 'command' ? `> ${log.text}` : log.text}
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", marginTop: "8px", gap: "8px" }}>
                    <input
                        type="text"
                        value={inputCommand}
                        onChange={e => setInputCommand(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSendCommand()}
                        placeholder="Введите команду (например: print('hi'))"
                        style={{
                            flexGrow: 1,
                            background: "#1a1a1a",
                            color: "white",
                            border: "1px solid #444",
                            borderRadius: "8px",
                            padding: "8px 10px",
                            fontFamily: "monospace",
                        }}
                        disabled={!port}
                    />
                    <button
                        onClick={handleSendCommand}
                        className={Style.button}
                        style={{width: "20%"}}
                        disabled={!port}
                    >
                        Отправить
                    </button>
                </div>
            </div>

        </div>
    );
}