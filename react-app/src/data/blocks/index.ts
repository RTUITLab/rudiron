import {BlocksData} from "../../types/blocks";


export default function blocksData(): BlocksData {
    return {
        blocks: [
            {
                "block_name": "if",
                "menu_name": "Если кнопка, то",
                "category": "Условия",
                "fields": [
                    {
                        "name": "if-pin",
                        "placeholder": "Выберите кнопку",
                        "type": 1,
                        "hardcoded": true,
                        "values": [1, 2, 3, 4, 5]
                    },
                    {
                        "name": "if-button",
                        "placeholder": "Выберите значение сигнала",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["HIGH", "LOW"]
                    },
                    {
                        "name": "if-body",
                        "placeholder": "Перенесите сюда блоки",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "if (digitalRead(%if-pin%) == %if-button%)",
                "workspace": false,
            },
            {
                "block_name": "create_variable",
                "menu_name": "Объявить переменную",
                "category": "Переменные",
                "fields": [
                    {
                        "name": "var-type",
                        "placeholder": "Выберите тип",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["int", "bool", "char", "float"]
                    },
                    {
                        "name": "var-name",
                        "placeholder": "Введите название",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var-type% %var-name% = 0;",
                "workspace": false,
            },
            {
                "block_name": "select_variable",
                "menu_name": "Переменная",
                "category": "Переменные",
                "fields": [
                    {
                        "name": "var-selector",
                        "placeholder": "Выберите переменную",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    }

                ],
                "default_code": "%var-selector%",
                "workspace": false,
            },
            {
                "block_name": "function_main",
                "menu_name": "Функция main",
                "category": "Функции",
                "fields": [
                    {
                        "name": "main-body",
                        "placeholder": "Перенесите сюда блоки",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }

                ],
                "default_code": "int main(){%n%%tab%%main-body%%n%return 0;%n%%-tab%}",
                "workspace": true,
            },
            {
                "block_name": "function_main",
                "menu_name": "Функция",
                "category": "Функции",
                "fields": [
                    {
                        "name": "func-type",
                        "placeholder": "Выберите тип возвращаемого значения",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["int", "void", "bool", "char", "float"]
                    },
                    {
                        "name": "func-name",
                        "placeholder": "Введите название функции",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "func-body",
                        "placeholder": "Перенесите сюда блоки",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }

                ],
                "default_code": "%func-type% %func-name%()\n{%func-body%\n}",
                "workspace": true,
            }
        ]
    }
}