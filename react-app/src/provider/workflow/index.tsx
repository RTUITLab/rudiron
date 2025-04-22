import {useEffect, useState} from "react";
import CodeContext, {CodeType} from "../../context/code";
import Workspace from "../../components/Workspace";
import Categories from "../../types/categories";
import Blocks from "../../types/blocks";
import generatorCode from "../../utils/generatorCode";

interface Props {
    categories: Categories,
    blocks: Blocks,
}

export default function ProviderWorkspace({categories, blocks}: Props) {
    const [codeState, setCodeState] = useState<CodeType[]>([]);

    const updateData = (newData: CodeType, operation: "set" | "delete") => {
        if (operation === "set") {
            setCodeState([...codeState, newData]);
        }
        else{
            setCodeState((prevState: CodeType[]) => prevState.filter((value) => value.id !== newData.id));
        }
    };

    useEffect(() => {
        for(let i = 0; i < codeState.length; i++)
        {
            generatorCode(codeState[i].code)
        }
    }, [codeState]);

    return (
        <CodeContext.Provider value={{value: codeState, updateData: updateData}}>
            <Workspace blocks={blocks} categories={categories}/>
        </CodeContext.Provider>
    )
}