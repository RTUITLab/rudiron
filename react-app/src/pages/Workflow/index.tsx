import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import Style from "./workflow.module.scss";

export default function WorkflowPage() {
    const navigate = useNavigate();
    const [dataCategories] = useState<Categories>(categoriesData().categories);
    const [dataBlocks] = useState<Blocks>(blocksData().blocks);

    const handleBackToApp = () => {
        navigate("/app");
    };

    const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

    return (
        <BlockProvider>
            <VariableProvider>
                <VariablesProvider>
                    <DndProvider backend={HTML5Backend}>
                        <div className={Style.WorkflowPage}>
                            <header className={Style.Header}>
                                <div>
                                    <button onClick={handleBackToApp} className={Style.BackButton}>
                                        ← Назад к App
                                    </button>
                                    <h1>Workflow</h1>
                                </div>
                                <div className={Style.UserInfo}>
                                    {userInfo.display_name && (
                                        <span>Привет, {userInfo.display_name}!</span>
                                    )}
                                </div>
                            </header>
                            <div className={Style.Content}>
                                <ProviderWorkspace 
                                    categories={dataCategories} 
                                    blocks={dataBlocks}
                                />
                            </div>
                        </div>
                    </DndProvider>
                </VariablesProvider>
            </VariableProvider>
        </BlockProvider>
    );
}

