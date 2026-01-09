"use client";
import React, { useState, useContext, useEffect } from "react";
import { useFlasher } from "@/hooks/useFlasher";
import generatorCode from "@/utils/generatorCode";
import CodeContext, { CodeType } from "@/context/code";
import Style from "./FlasherPanel.module.scss";
import { useClipboard } from "@/hooks/useClipboard";
import JSZip from "jszip";

export default function FlasherPanel() {
    const { device, isConnected, connectDevice, uploadBin, progress } = useFlasher();
    const [formattedCode, setFormattedCode] = useState("");
    const [binFile, setBinFile] = useState<File | null>(null);
    const { value: codeState } = useContext(CodeContext);
    const { copying, isCopied } = useClipboard();

    const generateCodeFromBlocks = () => {
        if (!codeState || codeState.length === 0) return "";

        const childIds = new Set<number>();
        codeState.forEach((item: CodeType) =>
            item.children.forEach((child: CodeType) => childIds.add(child.id))
        );
        const roots = codeState.filter((i: CodeType) => !childIds.has(i.id));
        return roots.map((i: CodeType) => i.code).join("\n\n") || "";
    };

    useEffect(() => {
        const generatedCode = generateCodeFromBlocks();
        if (generatedCode) {
            const formatted = generatorCode(generatedCode);
            setFormattedCode(formatted);
        } else {
            setFormattedCode("");
        }
    }, [codeState]);

    const handleDownloadIno = async () => {
        if (!formattedCode.trim()) {
            alert("Нет сгенерированного кода!");
            return;
        }

        const date = new Date().toISOString().split("T")[0];
        const sketchName = `sketch_${date}`;

        const zip = new JSZip();
        const folder = zip.folder(sketchName);

        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const encoder = new TextEncoder();
        const body = encoder.encode(formattedCode.trimEnd());

        folder?.file(`${sketchName}.ino`, new Blob([bom, body], { type: "text/plain" }));

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${sketchName}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    };



    const handleUpload = () => {
        if (!binFile) {
            alert("Выберите BIN файл для загрузки!");
            return;
        }
        uploadBin(binFile);
    };

    return (
        <div>
            <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <label style={{ fontWeight: "bold", textAlign: "start", marginLeft: "5px" }}>
                        Отформатированный .ino код
                    </label>

                    {!isCopied && (
                        <div onClick={() => copying(formattedCode)} style={{ height: "20px" }}>
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
                </div>

                <textarea
                    value={formattedCode}
                    readOnly
                    rows={10}
                    className={Style.textarea}
                    placeholder="Отформатированный код для .ino"
                />
            </div>

            <div style={{ margin: "10px 0", display: "flex", gap: "10px" }}>
                <button onClick={handleDownloadIno} disabled={!formattedCode} className={Style.button}>
                    Скачать как ZIP (.ino)
                </button>
            </div>

            <div style={{ marginTop: 10, marginBottom: 10 }}>
                <button onClick={connectDevice}>
                    {isConnected ? `Подключено: ${device?.productName}` : "Подключить устройство (мок)"}
                </button>
            </div>

            <div style={{ marginTop: 10, padding: "10px", borderRadius: "5px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                        type="file"
                        accept=".bin"
                        onChange={(e) => {
                            if (e.target.files?.[0]) setBinFile(e.target.files[0]);
                        }}
                        style={{ flex: 1 }}
                    />
                    <button onClick={handleUpload} style={{ padding: "8px 16px" }}>
                        Загрузить BIN
                    </button>
                </div>
            </div>

            {progress > 0 && (
                <div style={{ marginTop: 10 }}>
                    <div>Прогресс: {progress}%</div>
                    <progress value={progress} max="100" style={{ width: "100%" }} />
                </div>
            )}
        </div>
    );
}
