import blocksData from "../blocks";
import {CategoriesData} from "../../types/categories";


export default function categoriesData(): CategoriesData {
    return {
        categories: [
            {
                "name": "Условия",
                "color": "#b17267"
            },
            {
                "name": "Переменные",
                "color": "#7b917b"
            },
            {
                "name": "Функции",
                "color": "#ab49c7"
            }
        ]
    }
}