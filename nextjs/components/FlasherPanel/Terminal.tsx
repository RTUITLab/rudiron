import React from "react";

interface TerminalProps {
    logs: string[];
    inputCommand: string;
    onInputChange: (value: string) => void;
    onSendCommand: () => void;
    disabled: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
                                                      logs,
                                                      inputCommand,
                                                      onInputChange,
                                                      onSendCommand,
                                                      disabled
                                                  }) => {
    return (
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
                dangerouslySetInnerHTML={{ __html: logs.join("<br>") }}
            />

            <div style={{ display: "flex", marginTop: "8px", gap: "8px" }}>
                <input
                    type="text"
                    value={inputCommand}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && onSendCommand()}
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
                    disabled={disabled}
                />
                <button
                    onClick={onSendCommand}
                    style={{
                        width: "20%",
                        background: disabled ? "#555" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: disabled ? "not-allowed" : "pointer"
                    }}
                    disabled={disabled}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};