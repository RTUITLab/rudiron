import React, {useState, FC, useEffect} from "react";
import Workspace from "./components/Workspace";
import { VariableProvider } from "./components/Blocks/Var/VariableContext";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BlockProvider } from "./components/Blocks/Var/BlockContext";
import Categories from "./types/categories";
import Blocks from "./types/blocks";
import blocksData from "./data/blocks";
import categoriesData from "./data/categories";
import ProviderWorkspace from "./provider/workflow";

const App: FC = () => {
    const [dataCategories] = useState<Categories>(categoriesData().categories);
    const [dataBlocks] = useState<Blocks>(blocksData().blocks);

    return (
        <BlockProvider>
            <VariableProvider>
                <DndProvider backend={HTML5Backend}>
                    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                        <ProviderWorkspace categories={dataCategories} blocks={dataBlocks}/>
                    </div>
                </DndProvider>
            </VariableProvider>
        </BlockProvider>
    );
};

export default App;