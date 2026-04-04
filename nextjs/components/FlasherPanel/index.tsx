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

export default function FlasherPanel() {
    const [formattedCode, setFormattedCode] = useState("");
    const [binFile, setBinFile] = useState<File | null>(null);
    const { value: codeState } = useContext(CodeContext);
    const [port, setPort] = useState<SerialPort | null>(null);
    const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
    const [result, setResult] = useState<string>("");
    const [isFlashing, setIsFlashing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [inputCommand, setInputCommand] = useState("");
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);


    const fileInputRef = useRef<HTMLInputElement>(null);

    const { loaderFirmware } = useUploaderFirmware((line) => {
        setTerminalLogs(prev => [...prev, `[FLASH] ${line}`]);
    });

    const { eraseFlash } = useEraseFlash((line) => {
        setTerminalLogs(prev => [...prev, `[ERASE] ${line}`]);
    });
    const { checkFirmware } = useFirmwareCheck(port);

    useEffect(() => {
        // Загружаем файл по умолчанию из public
        const loadDefaultFirmware = async () => {
            try {
                // URL к файлу в public папке
                const response = await fetch('/ESP32_GENERIC-20251209-v1.27.0.bin');

                if (!response.ok) {
                    throw new Error(`Не удалось загрузить файл: ${response.status}`);
                }

                // Получаем данные как ArrayBuffer
                const arrayBuffer = await response.arrayBuffer();

                // Создаем File объект из данных
                const file = new File(
                    [arrayBuffer],
                    'ESP32_GENERIC-20251209-v1.27.0.bin',
                    { type: 'application/octet-stream' }
                );

                // Устанавливаем файл в состояние
                setFirmwareFile(file);

                // Также можно сохранить binFile если нужно
                setBinFile(file);

                setResult(`Автоматически выбран файл: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
            } catch (error) {
                console.error('[UI] Ошибка загрузки файла по умолчанию:', error);
                setResult('Не удалось загрузить example.bin из папки public');
            }
        };

        loadDefaultFirmware();
    }, []);

    const handleConnect = async () => {
        try {
            if (!("serial" in navigator)) {
                setResult("Web Serial API не поддерживается в этом браузере");
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
        } catch (error) {
            console.error("[UI] Ошибка подключения к порту:", error);
            setResult(`Ошибка подключения: ${error instanceof Error ? error.message : String(error)}`);
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
            return;
        }

        try {
            const result = await checkFirmware();
            setResult(result.message);
        } catch (error) {
            console.log(error);
        }
    }

    // Прошивка MicroPython
    const handleUploadFirmware = async () => {
        if (!port) {
            setResult("Сначала выберите порт");
            return;
        }
        if (!firmwareFile) {
            setResult("Сначала выберите файл прошивки");
            return;
        }

        setIsFlashing(true);
        setResult("Начинается прошивка...");

        try {
            await stopReadLoop();
            const result = await loaderFirmware(port, firmwareFile, (percent) => {
                setProgress(percent);
            });
            setResult(result.message);

            await ensurePortOpen(port);
            setFirmwareFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error("Ошибка прошивки:", err);
            setResult(`Ошибка прошивки: ${err instanceof Error ? err.message : String(err)}`);
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
        } catch (err) {
            console.error("[UI] Ошибка закрытия порта:", err);
            setResult(`Ошибка закрытия порта: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    const handleEraseFlash = async () => {
        if (!port) return;

        try {
            await stopReadLoop();
            const result = await eraseFlash(port);
            setResult(result.message);

            await ensurePortOpen(port);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSendCommand = async () => {
        if (!port || !inputCommand.trim()) return;

        const writer = port.writable?.getWriter();
        if (!writer) return;

        const encoder = new TextEncoder();
        const cmd = inputCommand.trim() + "\r\n";
        await writer.write(encoder.encode(cmd));
        writer.releaseLock();

        setTerminalLogs(prev => [...prev, `<span style="color:#999">> ${inputCommand}</span>`]);
        setInputCommand("");
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
            return;
        }

        if (!formattedCode.trim()) {
            setResult("Нет кода для отправки");
            return;
        }

        const log = (msg: string) =>
            setTerminalLogs(prev => [...prev, `[CODE] ${msg}`]);

        try {
            const encoder = new TextEncoder();

            const writer = port.writable?.getWriter();
            if (!writer) {
                log("❌ Порт не готов к записи");
                return;
            }

            await writer.write(encoder.encode('\r\x03\x03'));
            await new Promise(r => setTimeout(r, 100));
            await writer.write(encoder.encode('\r\x01'));
            await new Promise(r => setTimeout(r, 100));

            const lines = formattedCode.split("\n");
            for (const line of lines) {
                await writer.write(encoder.encode(line + "\r\n"));
                log(`→ ${line}`);
                await new Promise(r => setTimeout(r, 10));
            }

            await writer.write(encoder.encode('\x04'));
            await new Promise(r => setTimeout(r, 1500));

            await writer.write(encoder.encode('\r\x02'));
            writer.releaseLock();

            setResult("Код успешно отправлен и выполнен");

        } catch (error) {
            console.error("Ошибка при отправке кода:", error);
            setResult(`Ошибка отправки: ${error instanceof Error ? error.message : String(error)}`);
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

                        // Если пришёл перевод строки → отправляем в лог
                        if (text.includes("\n")) {
                            const lines = buffer.split(/\r?\n/);
                            buffer = lines.pop() || "";
                            setTerminalLogs(prev => [...prev, ...lines]);
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

            <div className={Style.progressSection}>
                {isFlashing ?
                    <>
                        <div className={Style.progressHeader}>
                            <span className={Style.progressLabel}>Прогресс прошивки:</span>
                            <span className={Style.progressValue}>{progress}%</span>
                        </div>

                        <div className={Style.customProgress}>
                            <div className={Style.progressFill} id={"progressPercent"} style={{ width: `${progress}%` }} />
                            <div className={Style.progressStripes} />
                        </div>
                    </>
                    :
                    <></>
                }
            </div>

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
                    id="terminal"
                    style={{
                        width: "100%",
                        height: 240,
                        overflowY: "auto",
                        background: "black",
                        borderRadius: "20px",
                        padding: "12px",
                        color: "white",
                        fontSize: "12px",
                        textAlign: "start",
                        fontFamily: "monospace",
                        lineHeight: "1.4em",
                    }}
                >
                    {terminalLogs.map((line, i) => (
                        <div key={i}>{line}</div>
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
