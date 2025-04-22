import {SelectHTMLAttributes, useEffect, useRef} from "react";
import Style from "./blockList.module.scss";
import Icon from "../../arrow-down-01-round.svg";

interface Props {
    title: string;
    systemTitle: string;
    values: number[] | string[],
    setValue: (newValue: number | string) => void,
}

export default function BlockList({title, systemTitle, values, setValue}: Props) {
    useEffect(() => {
        setValue(values[0])
    }, []);

    return (
        <div className={Style.BlockList}>
            <label htmlFor={systemTitle}>{title}</label>
            <div>
                <select name={systemTitle} onChange={(e) => setValue(values[Number(e.target.value)])}>
                    {values.map((value, index) => (
                        <option key={index} value={index}>{value}</option>
                    ))}
                </select>
                <img src={Icon}/>
            </div>
        </div>
    )
}