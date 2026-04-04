"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
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
import "driver.js/dist/driver.css";
import {driver} from "driver.js";

export default function Project() {
    const { id } = useParams<{ id: string }>();
    const projectId = id;
    const [dataCategories] = useState<Categories>(categoriesData().categories);
    const [dataBlocks] = useState<Blocks>(blocksData().blocks);
    const [isTour, setIsTour] = useState<boolean>(false);

    // 🚀 Интерактивный тур по рабочему пространству
    const driverObj = driver({
        showProgress: true,
        allowClose: false,          // Не даём закрыть тур случайно
        animate: true,              // Плавные анимации
        opacity: 0.75,             // Приятное затемнение фона
        padding: 10,               // Отступ вокруг элементов
        stagePadding: 5,           // Внутренний отступ подсветки
        nextBtnText: 'Вперёд →',   // Кастомные кнопки
        prevBtnText: '← Назад',
        doneBtnText: 'Отлично! ✨',
        popoverClass: 'custom-driver-popover', // Кастомный класс для стилизации
        steps: [
            {
                element: '#header',
                popover: {
                    title: "🎯 Добро пожаловать!",
                    description: "Это ваша главная панель управления. Здесь вы найдёте всё необходимое для работы с проектом.",
                    side: "bottom"
                }
            },
            {
                element: '#project-name',
                popover: {
                    title: "📝 Имя проекта",
                    description: "Ваш текущий проект называется именно так. Можете изменить название в любой момент — просто кликните по нему!",
                    side: "right"
                }
            },
            {
                element: '#category',
                popover: {
                    title: "🗂️ Категории блоков",
                    description: "Все доступные блоки сгруппированы по категориям. Выбирайте нужную и перетаскивайте блоки на рабочую область!",
                    side: "right"
                }
            },
            {
                element: '#set_variable',
                popover: {
                    title: "💡 Как присвоить значение переменной",
                    description: "Это просто! Перетащите любой блок из категории слева прямо сюда, в главную область. А я покажу, как это работает ✨",
                    side: "right"
                }
            },
            {
                element: '.workspace-area',
                popover: {
                    title: "🎨 Ваше рабочее пространство",
                    description: "Здесь будет строиться ваша логика. Комбинируйте блоки, соединяйте их и создавайте мощные сценарии!",
                    side: "top"
                }
            }
        ],
        onNext: (element) => {
            console.log(`✨ Переход к следующему шагу: ${element?.getAttribute('id') || 'неизвестный элемент'}`);
        },
        onPrevious: (element) => {
            console.log(`🔙 Возврат к шагу: ${element?.getAttribute('id') || 'неизвестный элемент'}`);
        },
        onClose: () => {
            console.log('🎉 Тур завершён! Удачной работы с проектом!');
            localStorage.setItem('tourCompleted', 'true');
        }
    });

    // 🎬 Запускаем тур с небольшой задержкой, чтобы страница успела отрендериться
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('tourCompleted');

        // Показываем тур только если пользователь его ещё не видел
        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                setIsTour(true);
            }, 1500); // Уменьшил задержку до 1.5 секунд для лучшего UX

            return () => clearTimeout(timer);
        }
    }, []);

    // 🚀 Запускаем интерактивный гид при активации
    useEffect(() => {
        if (isTour) {
            // Небольшая задержка для полного рендера DOM
            setTimeout(() => {
                driverObj.drive();
            }, 300);
        }
    }, [isTour]);

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