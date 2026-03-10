import { useState, useContext } from "react";
import generatorCode from "@/utils/generatorCode";
import CodeContext, { CodeType } from "@/context/code";

export const useCodeGeneration = () => {
    const [formattedCode, setFormattedCode] = useState("");
    const { value: codeState } = useContext(CodeContext);

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

    const formatCode = () => {
        const pythonCode = generateCodeFromBlocks();
        const formatted = generatorCode(pythonCode);
        setFormattedCode(formatted);
        return formatted;
    };

    return {
        formattedCode,
        setFormattedCode,
        generateCodeFromBlocks,
        formatCode
    };
};