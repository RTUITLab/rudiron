import Style from "./search.module.scss";
import {Dispatch, useEffect, useState, SetStateAction} from "react";
import Blocks from "../../types/blocks";
import blocks from "../../types/blocks";

interface Props {
    originBlocks: Blocks;
    setSortedBlocks: Dispatch<SetStateAction<Blocks>>;
}

const isWhitespaceString = (str: string) => str.replace(/\s/g, '').length

export default function Search({originBlocks, setSortedBlocks}: Props) {
    const [value, setValue] = useState("");

    useEffect(() => {
        if (isWhitespaceString(value))
        {
            const buffer: Blocks = [];
            for(let i = 0; i < originBlocks.length; i++)
            {
                if(originBlocks[i].menu_name.includes(value))
                {
                    buffer.push(originBlocks[i]);
                }
            }
            setSortedBlocks([...buffer]);
        }
        else
        {
            setSortedBlocks([...originBlocks]);
        }
    }, [value]);

    return (
        <div className={Style.Search}>
            <h3>Блоки</h3>
            <input type="text" value={value} onChange={(e) => {setValue(e.target.value)}} placeholder="Поиск..." />
        </div>
    )
}