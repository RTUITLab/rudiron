import { useState } from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import { VariableProvider } from "../../components/Blocks/Var/VariableContext";
import { BlockProvider } from "../../components/Blocks/Var/BlockContext";
import { VariablesProvider } from "../../context/variables";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Categories from "../../types/categories";
import Blocks from "../../types/blocks";
import blocksData from "../../data/blocks";
import categoriesData from "../../data/categories";
import ProviderWorkspace from "../../provider/workflow";
import Style from "./Project.module.scss";
import Header from "../../components/Header";

export default function Project() {
    const [dataCategories] = useState<Categories>(categoriesData().categories);
    const [dataBlocks] = useState<Blocks>(blocksData().blocks);
    const { id } = useParams<{ id: string }>();
    const projectId = id;


    return (
        <BlockProvider>
            <VariableProvider>
                <VariablesProvider>
                    <DndProvider backend={HTML5Backend}>
                        <div className={Style.AppPage}>
                            <Header/>
                            <div className={Style.Content}>
                                <ProviderWorkspace
                                    categories={dataCategories}
                                    blocks={dataBlocks}
                                    projectId={projectId}
                                />
                            </div>
                        </div>
                    </DndProvider>
                </VariablesProvider>
            </VariableProvider>
        </BlockProvider>
    );
}

