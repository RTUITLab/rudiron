import React from "react";
import Style from "./FlasherPanel.module.scss";

interface ProgressBarProps {
    isFlashing: boolean;
    progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ isFlashing, progress }) => {
    if (!isFlashing) return null;

    return (
        <div className={Style.progressSection}>
            <div className={Style.progressHeader}>
                <span className={Style.progressLabel}>Прогресс прошивки:</span>
                <span className={Style.progressValue}>{progress}%</span>
            </div>

            <div className={Style.customProgress}>
                <div
                    className={Style.progressFill}
                    style={{ width: `${progress}%` }}
                />
                <div className={Style.progressStripes} />
            </div>
        </div>
    );
};