import {CategoriesData} from "../../types/categories";


export default function categoriesData(): CategoriesData {
    return {
        categories: [
            {
                name: "Условия",
                color: "#FF6F00" // ярко-оранжевый, почти горящий
            },
            {
                name: "Переменные",
                color: "#FF1744" // неоново-красный
            },
            {
                name: "Функции",
                color: "#D500F9" // кислотный фиолетовый
            },
            {
                name: "Структура",
                color: "#00f915"
            },
            {
                name: "Циклы",
                color: "#0066ff"
            },
            {
                name: "Ввод/Вывод",
                color: "#FFD800"
            },
            {
                name: "Время",
                color: "#ff8000"
            },
            {
                name: "Serial",
                color: "#00ffd9"
            },
            {
                name: "Математика",
                color: "#c1e43a"
            }
        ]
    }
}

