import { useEffect, useState } from "react";
import Style from "./blockList.module.scss";
import Icon from "@/assets/arrow-down-01-round.svg";
import Image from "next/image";

interface Props {
    title: string;
    systemTitle: string;
    values: number[] | string[];
    setValue: (newValue: number | string) => void;
    value?: string | number;
    disabled?: boolean;
}

export default function BlockList({ title, systemTitle, values, setValue, value: controlledValue, disabled = false }: Props) {
    const [internalValue, setInternalValue] = useState<string | number | undefined>(undefined);
    const isControlled = controlledValue !== undefined;
    const defaultValue = values.includes("Выбор") ? "Выбор" : (values.includes("Пусто") ? "Пусто" : (values.length > 0 ? values[0] : undefined));
    const currentValue = isControlled ? controlledValue : (internalValue ?? defaultValue);
    const currentIndex = values.findIndex(v => v === currentValue);
    const selectedIndex = currentIndex >= 0 ? currentIndex : 0;

    useEffect(() => {
        if (isControlled && controlledValue !== undefined) {
        }
    }, [isControlled, controlledValue]);

    useEffect(() => {
        if (values.length > 0 && !isControlled && internalValue === undefined) {
            const defaultVal = values.includes("Выбор") ? "Выбор" : (values.includes("Пусто") ? "Пусто" : values[0]);
            setInternalValue(defaultVal);
            if (internalValue !== defaultVal) {
                setValue(defaultVal);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values, systemTitle]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation();
        const newIndex = Number(e.target.value);
        const newValue = values[newIndex];
        if (!isControlled) setInternalValue(newValue);
        setValue(newValue);
    };

    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <div className={Style.BlockList}>
            <label htmlFor={systemTitle}>{title}</label>
            <div>
                <select
                    name={systemTitle}
                    id={systemTitle}
                    value={selectedIndex}
                    onChange={handleChange}
                    disabled={disabled}
                    onMouseDown={stop}
                    onClick={stop}
                    onFocus={stop}
                >
                    {values.map((value, index) => (
                        <option key={index} value={index}>
                            {value}
                        </option>
                    ))}
                </select>
                <Image src={Icon} alt="icon" />
            </div>
        </div>
    );
}
