import { useState } from "react";
import Style from "./blockInput.module.scss";

interface Props {
    title: string;
    systemTitle: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export default function BlockInput({ title, systemTitle, value: controlledValue, onChange, disabled = false }: Props) {
    const [internalValue, setInternalValue] = useState("");
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const newValue = e.target.value;

        if (onChange) onChange(newValue);
        if (!isControlled) setInternalValue(newValue);
    };

    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <div className={Style.BlockInput}>
            <label htmlFor={systemTitle}>{title}</label>
            <input
                placeholder={title + "..."}
                name={systemTitle}
                id={systemTitle}
                type="text"
                value={value}
                onChange={handleChange}
                disabled={disabled}
                onMouseDown={stop}
                onClick={stop}
                onFocus={stop}
            />
        </div>
    );
}
