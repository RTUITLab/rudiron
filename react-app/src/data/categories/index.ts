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
            }
        ]
    }
}

