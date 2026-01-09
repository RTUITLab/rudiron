import {useCallback, useState} from "react";
import CodeContext, {CodeType} from "@/context/code";
import Workspace from "@/components/Workspace";
import Categories from "@/types/categories";
import Blocks from "@/types/blocks";

interface Props {
    categories: Categories,
    blocks: Blocks,
    projectId?: string
}

export default function ProviderWorkspace({categories, blocks, projectId}: Props) {
    const [codeState, setCodeState] = useState<CodeType[]>([]);

    const updateData = useCallback((newData: CodeType, operation: "set" | "delete") => {
        setCodeState(prevState => {
            if (operation === "set") {
                const existingIndex = prevState.findIndex(v => v.id === newData.id);
                if (existingIndex !== -1) {
                    const existing = prevState[existingIndex];
                    // Проверяем, изменились ли code или children
                    const codeChanged = existing.code !== newData.code;
                    const childrenChanged = existing.children.length !== newData.children.length ||
                        existing.children.some((child, i) => 
                            child.id !== newData.children[i]?.id || child.code !== newData.children[i]?.code
                        );
                    
                    if (!codeChanged && !childrenChanged) {
                        return prevState; // Ничего не изменилось
                    }
                }
                
                const withoutCurrent = prevState.filter(v => v.id !== newData.id);
                return [...withoutCurrent, newData];
            } else {
                const nextState = prevState.filter(v => v.id !== newData.id);
                if (nextState.length === prevState.length) return prevState;
                return nextState;
            }
        });
    }, []);
    


    return (
        <CodeContext.Provider value={{value: codeState, updateData: updateData}}>
            <Workspace blocks={blocks} categories={categories} projectId={projectId}/>
        </CodeContext.Provider>
    )
}