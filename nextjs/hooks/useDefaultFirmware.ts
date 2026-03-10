import { useState, useEffect } from "react";

export const useDefaultFirmware = () => {
    const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
    const [binFile, setBinFile] = useState<File | null>(null);
    const [result, setResult] = useState<string>("");

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
            } catch (error) {
                console.error('Ошибка загрузки файла по умолчанию:', error);
                setResult('Не удалось загрузить example.bin из папки public');
            }
        };

        loadDefaultFirmware();
    }, []);

    return {
        firmwareFile,
        setFirmwareFile,
        binFile,
        setBinFile,
        result,
        setResult
    };
};