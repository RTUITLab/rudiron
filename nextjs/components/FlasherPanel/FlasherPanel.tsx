"use client";
import React, { useState } from "react";
import Style from "./FlasherPanel.module.scss";
import { useSerialPort } from "@/hooks/useSerialPort";
import { useDefaultFirmware } from "@/hooks/useDefaultFirmware";
import { useTerminal } from "@/hooks/useTerminal";
import { useCodeGeneration } from "@/hooks/useCodeGeneration";
import { useUploaderFirmware } from "@/hooks/useUploaderFirmware";
import { useEraseFlash } from "@/hooks/useEraseFlash";
import { useFirmwareCheck } from "@/hooks/useFirmwareCheck";
import { CodeDisplay } from "./CodeDisplay";
import { ConnectionStatus } from "./ConnectionStatus";
import { ProgressBar } from "./ProgressBar";
import { ControlButtons } from "./ControlButtons";
import { Terminal } from "./Terminal";

export default function FlasherPanel() {
    const [isFlashing, setIsFlashing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState("");

    const { port, isConnected, connect, disconnect, ensurePortOpen } = useSerialPort();
    const { firmwareFile, setFirmwareFile, binFile, setBinFile } = useDefaultFirmware();
    const { formattedCode, formatCode } = useCodeGeneration();
    const { terminalLogs, inputCommand, setInputCommand, sendCommand, addLog, stopReadLoop } = useTerminal(port);

    const { loaderFirmware } = useUploaderFirmware((line) => addLog(`[FLASH] ${line}`));
    const { eraseFlash } = useEraseFlash((line) => addLog(`[ERASE] ${line}`));
    const { checkFirmware } = useFirmwareCheck(port);

    const handleConnect = async () => {
        const result = await connect();
        if (result.success) {
            setResult("Порт подключен. Теперь выберите файл прошивки.");
        } else {
            setResult(`Ошибка подключения: ${result.error}`);
        }
    };

    const handleDisconnect = async () => {
        const result = await disconnect();
        if (result) {
            if (result.success) {
                setResult("Порт отключен");
            } else {
                setResult(`Ошибка отключения: ${result.error}`);
            }
        }
    };

    const handleUploadFirmware = async () => {
        if (!port || !firmwareFile) {
            setResult("Сначала выберите порт и файл прошивки");
            return;
        }

        setIsFlashing(true);
        setResult("Начинается прошивка...");

        try {
            await stopReadLoop();
            const result = await loaderFirmware(port, firmwareFile, setProgress);
            setResult(result.message);
            await ensurePortOpen(port);
        } catch (err) {
            setResult(`Ошибка прошивки: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsFlashing(false);
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
    };

    const sendCodeToDevice = async () => {
        if (!port) {
            setResult("Сначала подключите порт");
            return;
        }

        if (!formattedCode.trim()) {
            setResult("Нет кода для отправки");
            return;
        }

        try {
            const encoder = new TextEncoder();
            const writer = port.writable?.getWriter();

            if (!writer) {
                addLog("❌ Порт не готов к записи");
                return;
            }

            await writer.write(encoder.encode('\r\x03\x03'));
            await new Promise(r => setTimeout(r, 100));
            await writer.write(encoder.encode('\r\x01'));
            await new Promise(r => setTimeout(r, 100));

            const lines = formattedCode.split("\n");
            for (const line of lines) {
                await writer.write(encoder.encode(line + "\r\n"));
                addLog(`→ ${line}`);
                await new Promise(r => setTimeout(r, 10));
            }

            await writer.write(encoder.encode('\x04'));
            await new Promise(r => setTimeout(r, 1500));
            await writer.write(encoder.encode('\r\x02'));
            writer.releaseLock();

            setResult("Код успешно отправлен и выполнен");
        } catch (error) {
            setResult(`Ошибка отправки: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <div className={Style.panel}>
            <CodeDisplay code={formattedCode} />

            <ConnectionStatus
                isConnected={isConnected}
                isFlashing={isFlashing}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
            />

            <ProgressBar isFlashing={isFlashing} progress={progress} />

            <ControlButtons
                port={port}
                firmwareFile={firmwareFile}
                isFlashing={isFlashing}
                onUploadFirmware={handleUploadFirmware}
                onCheckFirmware={handleFirmwareCheck}
                onEraseFlash={handleEraseFlash}
                onSendCode={sendCodeToDevice}
            />

            <Terminal
                logs={terminalLogs}
                inputCommand={inputCommand}
                onInputChange={setInputCommand}
                onSendCommand={() => sendCommand(inputCommand)}
                disabled={!port}
            />
        </div>
    );
}