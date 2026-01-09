import Style from "./search.module.scss";
import {Dispatch, useEffect, useState, SetStateAction, useCallback} from "react";
import Blocks from "@/types/blocks";

interface Props {
    originBlocks: Blocks;
    setSortedBlocks: Dispatch<SetStateAction<Blocks>>;
}

const isWhitespaceString = (str: string) => str.replace(/\s/g, '').length

export default function Search({originBlocks, setSortedBlocks}: Props) {
    const [value, setValue] = useState("");

    const updateSortedBlocks = useCallback((searchValue: string) => {
        if (isWhitespaceString(searchValue))
        {
            const buffer: Blocks = [];
            for(let i = 0; i < originBlocks.length; i++)
            {
                if(originBlocks[i].menu_name.toLowerCase().includes(searchValue.toLowerCase()))
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
    }, [originBlocks, setSortedBlocks]);

    useEffect(() => {
        updateSortedBlocks(value);
    }, [value, updateSortedBlocks]);

    return (
        <div className={Style.Search}>
            <input type="text" value={value} onChange={(e) => {setValue(e.target.value)}} placeholder="Поиск..." />
        </div>
    )
}