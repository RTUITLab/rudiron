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

                console.log('[UI] Загружен файл по умолчанию:', file.name, `(${(file.size / 1024).toFixed(1)} KB)`);

                // Обновляем результат
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
                console.warn("Web Serial API не поддерживается");
                setResult("Web Serial API не поддерживается в этом браузере");
                return;
            }

            const pythonCode = generateCodeFromBlocks();
            const formatted = generatorCode(pythonCode);
            console.log(formatted);
            setFormattedCode(formatted);
            console.log(formattedCode);
            const nav = navigator as any;
            const selectedPort: SerialPort = await nav.serial.requestPort();
            if (!selectedPort) return;

            console.log("[UI] Выбран порт:", selectedPort);

            // Открываем порт сразу при подключении
            if (!selectedPort.readable) {
                await selectedPort.open({ baudRate: 115200 });
                console.log("[UI] Порт открыт (для REPL)", selectedPort);
            } else {
                console.log("[UI] Порт уже открыт (для REPL)", selectedPort);
            }

            setPort(selectedPort);
            setResult("Порт подключен. Теперь выберите файл прошивки.");
        } catch (error) {
            console.error("[UI] Ошибка подключения к порту:", error);
            setResult(`Ошибка подключения: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = event.target.files?.[0];
    //     if (file) {
    //         if (!file.name.toLowerCase().endsWith('.bin')) {
    //             setResult("Ошибка: выберите файл с расширением .bin");
    //             return;
    //         }
    //
    //         setFirmwareFile(file);
    //         setResult(`Выбран файл: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    //     }
    // };

    const stopReadLoop = async () => {
        if (readerRef.current) {
            try {
                console.log("[UI] Останавливаем readLoop...");
                await readerRef.current.cancel();
                readerRef.current.releaseLock();
                readerRef.current = null;
            } catch (e) {
                console.warn("[UI] Ошибка при остановке readLoop:", e);
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

            // После успешной прошивки
            setPort(null);
            setFirmwareFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            await ensurePortOpen(port);
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
            console.log("[UI] Ручное отключение от порта...");
            await port.close();
            console.log("[UI] Порт закрыт пользователем");
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

    const ensurePortOpen = async (port: SerialPort) => {
        if (!port.readable || !port.writable) {
            await port.open({ baudRate: 115200 });
            console.log("[UI] Порт открыт повторно для REPL");
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
                {/*
                    {!isCopied && (
                        <div onClick={() => copying(formattedCode)} style={{ height: "20px", cursor: "pointer" }}>
                            <svg viewBox="0 0 24 24" fill="#8f8f8f" height={20}>
                                <path d="M6.6 11.4c0-2.726 0-4.089.844-4.936S9.644 5.614 12.36 5.614h2.88c2.715 0 4.073 0 4.916.844.844.847.844 2.21.844 4.936v4.819c0 2.726 0 4.089-.844 4.936s-2.201.844-4.916.844h-2.88c-2.715 0-4.073 0-4.916-.844S6.6 18.943 6.6 16.217V11.4z"/>
                                <path d="M4.172 3.172C3 4.344 3 6.23 3 10v2c0 3.771 0 5.657 1.172 6.828.618.618 1.434.91 2.62 1.048-.191-.84-.191-1.996-.191-3.659V11.4c0-2.726 0-4.089.844-4.936.843-.847 2.201-.847 4.916-.847h2.88c1.652 0 2.801 0 3.638.19-.137-1.194-.43-2.014-1.049-2.632C16.657 2 14.77 2 11 2c-3.771 0-5.657 0-6.828 1.172z" opacity="0.5"/>
                            </svg>
                        </div>
                    )}
                    {isCopied && (
                        <div style={{display: "flex", alignItems: "center", gap: "8px", height: "20px", alignContent: "center"}}>
                            <p style={{margin: 0, fontSize: "14px", color: "#A7A7A7"}}>Сохранено</p>
                            <svg viewBox="0 0 12 12" fill="#8f8f8f" height={18}>
                                <path fillRule="evenodd" clipRule="evenodd" d="M6 12A6 6 0 106 0a6 6 0 000 12zm2.576-7.02a.75.75 0 00-1.152-.96L5.45 6.389l-.92-.92A.75.75 0 003.47 6.53l1.5 1.5a.75.75 0 001.106-.05l2.5-3z"/>
                            </svg>
                        </div>
                    )}
                    */}
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
                    dangerouslySetInnerHTML={{ __html: terminalLogs.join("<br>") }}
                ></div>

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
