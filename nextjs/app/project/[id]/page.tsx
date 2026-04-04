"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { VariableProvider } from "@/components/Blocks/Var/VariableContext";
import { BlockProvider } from "@/components/Blocks/Var/BlockContext";
import { VariablesProvider } from "@/context/variables";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Categories from "@/types/categories";
import Blocks from "@/types/blocks";
import blocksData from "@/data/blocks";
import categoriesData from "@/data/categories";
import ProviderWorkspace from "@/provider/workflow";
import Style from "./Project.module.scss";
import Header from "@/components/Header";
import { patchWorkflowShowTour } from "@/services/workflow";
import "driver.js/dist/driver.css";
import { driver } from "driver.js";

export default function Project() {
    const { id } = useParams<{ id: string }>();
    const projectId = id;
    const [dataCategories] = useState<Categories>(categoriesData().categories);
    const [dataBlocks] = useState<Blocks>(blocksData().blocks);
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);
    const tourCompletedRef = useRef(false);

    const startTour = useCallback(() => {
        tourCompletedRef.current = false;

        driverRef.current = driver({
            showProgress: true,
            allowClose: true,
            animate: true,
            opacity: 0.75,
            padding: 10,
            stagePadding: 5,
            nextBtnText: 'Вперёд →',
            prevBtnText: '← Назад',
            doneBtnText: 'Готово ✓',
            popoverClass: 'custom-driver-popover',
            steps: [
                {
                    element: '#header',
                    popover: {
                        title: "Добро пожаловать!",
                        description: "Это ваша главная панель управления. Здесь вы найдёте всё необходимое для работы с проектом.",
                        side: "bottom",
                    }
                },
                {
                    element: '#project-name',
                    popover: {
                        title: "Имя проекта",
                        description: "Ваш текущий проект называется именно так. Можете изменить название в любой момент — просто кликните по нему!",
                        side: "right",
                    }
                },
                {
                    element: '#category',
                    popover: {
                        title: "Категории блоков",
                        description: "Все доступные блоки сгруппированы по категориям. Выбирайте нужную и перетаскивайте блоки на рабочую область!",
                        side: "right",
                    }
                },
                {
                    element: '#set_variable',
                    popover: {
                        title: "Как присвоить значение переменной",
                        description: "Перетащите любой блок из категории слева прямо сюда, в главную область.",
                        side: "right",
                    }
                },
                {
                    element: '.workspace-area',
                    popover: {
                        title: "Ваше рабочее пространство",
                        description: "Здесь будет строиться ваша логика. Комбинируйте блоки, соединяйте их и создавайте мощные сценарии!",
                        side: "top",
                        onNextClick: () => {
                            tourCompletedRef.current = true;
                            driverRef.current?.moveNext();
                        },
                    }
                },
            ],
            onDestroyed: async () => {
                if (tourCompletedRef.current && projectId) {
                    try {
                        await patchWorkflowShowTour(projectId, false);
                    } catch (e) {
                        console.error("Не удалось сохранить флаг тура:", e);
                    }
                }
            },
        });

        driverRef.current.drive();
    }, [projectId]);

    const handleShowTour = useCallback((showTour: boolean) => {
        if (!showTour) return;
        const timer = setTimeout(() => startTour(), 800);
        return () => clearTimeout(timer);
    }, [startTour]);

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
                                    onShowTour={handleShowTour}
                                />
                            </div>
                        </div>
                    </DndProvider>
                </VariablesProvider>
            </VariableProvider>
        </BlockProvider>
    );
}
