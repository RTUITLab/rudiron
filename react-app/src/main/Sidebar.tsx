import React, { useState } from "react";
import "./menu.css";
import companyLogo from "./xd.png";

interface MenuProps {
    blocks: { id: string; label: string; createBlock: () => JSX.Element }[];
    onAddBlockToWorkspace: (block: JSX.Element) => void;
}

const Menu: React.FC<MenuProps> = ({ blocks, onAddBlockToWorkspace }) => {
    const [collapsedCategories, setCollapsedCategories] = useState<{
        [key: string]: boolean;
    }>({
        "Dev": false,
        "Условия": false,
        "Основные функции": false,
        "Переменные": false,
        "Чтение/Запись": false,
        "Монитор порта": false
    });

    const [searchQuery, setSearchQuery] = useState(""); // Состояние для строки поиска

    // Типизация категорий
    const categories: Record<
    "Dev" | "Условия" | "Основные функции" | "Переменные" | "Чтение/Запись" | "Монитор порта" | "Циклы",
    { blocks: string[]; color: string }
> = {
        "Dev": {blocks: ["new"], color: "#ffffff"},
    "Условия": { blocks: ["delay", "if"], color: "#D13A9A" }, // pink
    "Основные функции": { blocks: ["setup", "loop"], color: "#7e57c2" }, // Blue
    "Переменные": { blocks: ["variable", "variable-selector"], color: "#66bb6a" }, // Green
    "Чтение/Запись": { blocks: ["digital-read", "digital-write", "analog-read", "analog-write", "pinmode"], color: "#d32f2f" }, // Purple
    "Монитор порта": { blocks: ["serial-init"], color: "#D1C03A" }, // Red
    "Циклы": {blocks: ["for"], color: "#4D74F4"}
};

    // Функция для переключения состояния свёрнутой категории
    const toggleCategory = (category: keyof typeof categories) => {
        setCollapsedCategories((prevState) => ({
            ...prevState,
            [category]: !prevState[category],
        }));
    };

    // Фильтрация блоков на основе строки поиска
    const filteredBlocks = blocks.filter((block) =>
        block.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Рендеринг блоков по категории
    const renderBlocksByCategory = (category: keyof typeof categories) =>
        filteredBlocks
            .filter((block) => categories[category].blocks.includes(block.id))
            .map((block) => (
                <div
                    key={block.id}
                    className="menu-item"
                    style={{ borderLeftColor: categories[category].color }} // Dynamic left border color
                    onClick={() => onAddBlockToWorkspace(block.createBlock())}
                >
                    <span className="menu-item-label">{block.label}</span>
                    <span className="menu-item-info">
                        <span>2</span>
                        <i>ℹ️</i>
                    </span>
                </div>
            ));
    
    

    return (
        <div className="menu">
            {/* Логотип */}
            <img src={companyLogo} alt="Рудирон Education" className="menu-logo" />

            {/* Заголовок */}
            <h3>Блоки</h3>

            {/* Поле поиска */}
            <input
                type="text"
                className="menu-search"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Обновление строки поиска
            />

            {/* Категория: Dev */}
            <div className="menu-category" onClick={() => toggleCategory("Dev")}>
                Dev
                <span>{collapsedCategories["Dev"] ? "▲" : "▼"}</span>
            </div>
            {!collapsedCategories["Dev"] && (
                <div>{renderBlocksByCategory("Dev")}</div>
            )}

            {/* Категория: Условия */}
            <div className="menu-category" onClick={() => toggleCategory("Условия")}>
                Условия
                <span>{collapsedCategories["Условия"] ? "▲" : "▼"}</span>
            </div>
            {!collapsedCategories["Условия"] && (
                <div>{renderBlocksByCategory("Условия")}</div>
            )}

            {/* Категория: Основные функции */}
            <div className="menu-category" onClick={() => toggleCategory("Основные функции")}>
                Основные функции
                <span>{collapsedCategories["Основные функции"] ? "▲" : "▼"}</span>
            </div>
            {!collapsedCategories["Основные функции"] && (
                <div>{renderBlocksByCategory("Основные функции")}</div>
            )}

            {/* Категория: Переменные */}
            <div className="menu-category" onClick={() => toggleCategory("Переменные")}>
                Переменные
                <span>{collapsedCategories["Переменные"] ? "▲" : "▼"}</span>
            </div>
            {!collapsedCategories["Переменные"] && (
                <div>{renderBlocksByCategory("Переменные")}</div>
            )}
            
            {/* Категория: Чтение/Запись */}
            <div className="menu-category" onClick={() => toggleCategory("Чтение/Запись")}>
            Чтение/Запись
                <span>{collapsedCategories["Чтение/Запись"] ? "▲" : "▼"}</span>
            </div>
            {!collapsedCategories["Чтение/Запись"] && (
                <div>{renderBlocksByCategory("Чтение/Запись")}</div>
            )}

            {/* Категория: Чтение/Запись */}
            <div className="menu-category" onClick={() => toggleCategory("Монитор порта")}>
            Монитор порта
                <span>{collapsedCategories["Монитор порта"] ? "▲" : "▼"}</span>
            </div>
            {!collapsedCategories["Монитор порта"] && (
                <div>{renderBlocksByCategory("Монитор порта")}</div>
            )}

            {/* Категория: Циклы */}
            <div className="menu-category" onClick={() => toggleCategory("Циклы")}>
            Монитор порта
                <span>{collapsedCategories["Циклы"] ? "▲" : "▼"}</span>
            </div>
            {!collapsedCategories["Циклы"] && (
                <div>{renderBlocksByCategory("Циклы")}</div>
            )}
        </div>
    );
};

export default Menu;
