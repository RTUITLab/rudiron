import React from "react";
import Style from "./FlasherPanel.module.scss";

interface ConnectionStatusProps {
    isConnected: boolean;
    isFlashing: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
                                                                      isConnected,
                                                                      isFlashing,
                                                                      onConnect,
                                                                      onDisconnect
                                                                  }) => {
    return (
        <div style={{ margin: 10, justifyContent: "start", paddingBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" }}>
                {isConnected ? (
                    <>
                        <span style={{ fontSize: "16px", color: "#A7A7A7", fontWeight: "bold" }}>
                            🟢 Подключено
                        </span>
                        <button
                            onClick={onDisconnect}
                            className={Style.button}
                            style={{ width: "50%" }}
                            disabled={isFlashing}
                        >
                            Отключить
                        </button>
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: "16px", color: "#A7A7A7", fontWeight: "bold" }}>
                            🔴 Отключено
                        </span>
                        <button
                            onClick={onConnect}
                            className={Style.button}
                            style={{ width: "50%" }}
                        >
                            Подключить
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};