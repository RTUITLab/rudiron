import React from "react";
import SimpleCode from "@/components/SimpleCode";
import Style from "./FlasherPanel.module.scss";

interface CodeDisplayProps {
    code: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
    return (
        <div style={{ position: "relative" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px"
            }}>
                <label style={{
                    fontWeight: "bold",
                    textAlign: "start",
                    marginLeft: "5px",
                    marginBottom: "10px"
                }}>
                    Отформатированный код
                </label>
            </div>

            <SimpleCode code={code} language={"python"} />
        </div>
    );
};