import React from "react";
import Style from "./FlasherPanel.module.scss";

interface ControlButtonsProps {
    port: any | null;
    firmwareFile: File | null;
    isFlashing: boolean;
    onUploadFirmware: () => void;
    onCheckFirmware: () => void;
    onEraseFlash: () => void;
    onSendCode: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
                                                                  port,
                                                                  firmwareFile,
                                                                  isFlashing,
                                                                  onUploadFirmware,
                                                                  onCheckFirmware,
                                                                  onEraseFlash,
                                                                  onSendCode
                                                              }) => {
    return (
        <div className={Style.controls}>
            <button
                className={Style.button}
                disabled={!port || !firmwareFile || isFlashing}
                onClick={onUploadFirmware}
            >
                {isFlashing ? "Идет прошивка..." : "Загрузить прошивку"}
            </button>

            <button
                onClick={onCheckFirmware}
                disabled={!port || isFlashing}
                className={Style.button}
            >
                Проверка прошивки
            </button>

            <button
                onClick={onEraseFlash}
                disabled={!port || isFlashing}
                className={Style.button}
            >
                Очистить память
            </button>

            <button
                onClick={onSendCode}
                disabled={!port || isFlashing}
                className={Style.button}
            >
                Загрузка кода на устройство
            </button>
        </div>
    );
};