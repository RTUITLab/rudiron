import {useCallback, useState} from "react";
import CodeContext, {CodeType} from "../../context/code";
import Workspace from "../../components/Workspace";
import Categories from "../../types/categories";
import Blocks from "../../types/blocks";

interface Props {
    categories: Categories,
    blocks: Blocks,
    projectId?: string
}

export default function ProviderWorkspace({categories, blocks, projectId}: Props) {
    const [codeState, setCodeState] = useState<CodeType[]>([]);

    const updateData = useCallback((newData: CodeType, operation: "set" | "delete") => {
        setCodeState((prevState: CodeType[]) => {
            if (operation === "set") {
                const withoutCurrent = prevState.filter((value) => value.id !== newData.id);
                return [...withoutCurrent, newData];
            }
            return prevState.filter((value) => value.id !== newData.id);
        });
    }, []);

    return (
        <CodeContext.Provider value={{value: codeState, updateData: updateData}}>
            <Workspace blocks={blocks} categories={categories} projectId={projectId}/>
        </CodeContext.Provider>
    )
}