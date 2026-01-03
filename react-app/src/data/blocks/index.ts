import {BlocksData} from "../../types/blocks";


export default function blocksData(): BlocksData {
    return {
        blocks: [
            {
                "block_name": "arduino_sketch",
                "menu_name": "Скетч Arduino",
                "category": "Структура",
                "fields": [
                    {
                        "name": "includes-body",
                        "placeholder": "Подключения (#include) — перетащите блоки сюда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "globals-body",
                        "placeholder": "Глобальные переменные/константы — перетащите блоки сюда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "setup-body",
                        "placeholder": "setup() — выполняется один раз",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "loop-body",
                        "placeholder": "loop() — выполняется постоянно",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%includes-body%%n%%globals-body%%n%void setup(){%n%%tab%%setup-body%%n%%-tab%}%n%%n%void loop(){%n%%tab%%loop-body%%n%%-tab%}",
                "workspace": true,
            },
            {
                "block_name": "include_library",
                "menu_name": "#include библиотеку",
                "category": "Структура",
                "fields": [
                    {
                        "name": "lib-name",
                        "placeholder": "Например: Servo.h",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "#include <%lib-name%>",
                "workspace": false,
            },
            {
                "block_name": "comment",
                "menu_name": "Комментарий",
                "category": "Структура",
                "fields": [
                    {
                        "name": "comment-text",
                        "placeholder": "Текст комментария",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "// %comment-text%",
                "workspace": false,
            },
            {
                "block_name": "define",
                "menu_name": "#define",
                "category": "Структура",
                "fields": [
                    {
                        "name": "def-name",
                        "placeholder": "Имя (например LED_PIN)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "def-value",
                        "placeholder": "Значение (например 13)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "#define %def-name% %def-value%",
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
                "block_name": "set_variable",
                "menu_name": "Присвоить значение",
                "category": "Переменные",
                "fields": [
                    {
                        "name": "set-var",
                        "placeholder": "Переменная",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "set-value",
                        "placeholder": "Значение/выражение (например 123 или millis())",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%set-var% = %set-value%;",
                "workspace": false,
            },
            {
                "block_name": "increment",
                "menu_name": "Увеличить/уменьшить",
                "category": "Переменные",
                "fields": [
                    {
                        "name": "inc-var",
                        "placeholder": "Переменная",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "inc-op",
                        "placeholder": "Операция",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["++", "--", "+= 1", "-= 1"]
                    },
                ],
                "default_code": "%inc-var% %inc-op%;",
                "workspace": false,
            },

            {
                "block_name": "if_digital_read",
                "menu_name": "Если кнопка, то",
                "category": "Условия",
                "fields": [
                    {
                        "name": "if-pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, "A0", "A1", "A2", "A3", "A4", "A5"]
                    },
                    {
                        "name": "if-button",
                        "placeholder": "Сигнал",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["HIGH", "LOW"]
                    },
                    {
                        "name": "if-body",
                        "placeholder": "Тогда (перетащите блоки сюда)",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "if (digitalRead(%if-pin%) == %if-button%) {%n%%tab%%if-body%%n%%-tab%}",
                "workspace": false,
            }

            ,
            {
                "block_name": "if_condition",
                "menu_name": "Если (условие)",
                "category": "Условия",
                "fields": [
                    {
                        "name": "if-cond",
                        "placeholder": "Условие (например x > 10)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "if-body",
                        "placeholder": "Тогда (перетащите блоки сюда)",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "if (%if-cond%) {%n%%tab%%if-body%%n%%-tab%}",
                "workspace": false,
            },
            {
                "block_name": "if_else_condition",
                "menu_name": "Если/иначе",
                "category": "Условия",
                "fields": [
                    {
                        "name": "if-cond",
                        "placeholder": "Условие (например Serial.available() > 0)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "if-body",
                        "placeholder": "Тогда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "else-body",
                        "placeholder": "Иначе",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "if (%if-cond%) {%n%%tab%%if-body%%n%%-tab%} else {%n%%tab%%else-body%%n%%-tab%}",
                "workspace": false,
            },

            {
                "block_name": "for_loop",
                "menu_name": "Цикл for",
                "category": "Циклы",
                "fields": [
                    {
                        "name": "for-i",
                        "placeholder": "Имя счётчика (например i)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "for-from",
                        "placeholder": "От (например 0)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "for-to",
                        "placeholder": "До (например 10)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "for-step",
                        "placeholder": "Шаг (например 1)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "for-body",
                        "placeholder": "Тело цикла",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "for (int %for-i% = %for-from%; %for-i% <= %for-to%; %for-i% += %for-step%) {%n%%tab%%for-body%%n%%-tab%}",
                "workspace": false,
            },
            {
                "block_name": "while_loop",
                "menu_name": "Цикл while",
                "category": "Циклы",
                "fields": [
                    {
                        "name": "while-cond",
                        "placeholder": "Условие (например digitalRead(2) == HIGH)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "while-body",
                        "placeholder": "Тело цикла",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "while (%while-cond%) {%n%%tab%%while-body%%n%%-tab%}",
                "workspace": false,
            },
            {
                "block_name": "break",
                "menu_name": "break",
                "category": "Циклы",
                "fields": [],
                "default_code": "break;",
                "workspace": false,
            },
            {
                "block_name": "continue",
                "menu_name": "continue",
                "category": "Циклы",
                "fields": [],
                "default_code": "continue;",
                "workspace": false,
            },

            {
                "block_name": "pin_mode",
                "menu_name": "pinMode",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, "A0", "A1", "A2", "A3", "A4", "A5"]
                    },
                    {
                        "name": "mode",
                        "placeholder": "Режим",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["INPUT", "OUTPUT", "INPUT_PULLUP"]
                    }
                ],
                "default_code": "pinMode(%pin%, %mode%);",
                "workspace": false,
            },
            {
                "block_name": "digital_write",
                "menu_name": "digitalWrite",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                    },
                    {
                        "name": "value",
                        "placeholder": "Значение",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["HIGH", "LOW"]
                    }
                ],
                "default_code": "digitalWrite(%pin%, %value%);",
                "workspace": false,
            },
            {
                "block_name": "digital_read_into",
                "menu_name": "Считать digitalRead() в переменную",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                    }
                ],
                "default_code": "%var% = digitalRead(%pin%);",
                "workspace": false,
            },
            {
                "block_name": "analog_write",
                "menu_name": "analogWrite (PWM)",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "PWM пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [3, 5, 6, 9, 10, 11]
                    },
                    {
                        "name": "value",
                        "placeholder": "Значение 0..255",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "analogWrite(%pin%, %value%);",
                "workspace": false,
            },
            {
                "block_name": "analog_read_into",
                "menu_name": "Считать analogRead() в переменную",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "pin",
                        "placeholder": "Аналоговый пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["A0", "A1", "A2", "A3", "A4", "A5"]
                    }
                ],
                "default_code": "%var% = analogRead(%pin%);",
                "workspace": false,
            },
            {
                "block_name": "tone",
                "menu_name": "tone (частота)",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                    },
                    {
                        "name": "freq",
                        "placeholder": "Частота (Гц)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "tone(%pin%, %freq%);",
                "workspace": false,
            },
            {
                "block_name": "tone_duration",
                "menu_name": "tone (с длительностью)",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                    },
                    {
                        "name": "freq",
                        "placeholder": "Частота (Гц)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "dur",
                        "placeholder": "Длительность (мс)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "tone(%pin%, %freq%, %dur%);",
                "workspace": false,
            },
            {
                "block_name": "no_tone",
                "menu_name": "noTone",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                    }
                ],
                "default_code": "noTone(%pin%);",
                "workspace": false,
            },

            {
                "block_name": "delay",
                "menu_name": "delay",
                "category": "Время",
                "fields": [
                    {
                        "name": "ms",
                        "placeholder": "Миллисекунды",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "delay(%ms%);",
                "workspace": false,
            },
            {
                "block_name": "delay_us",
                "menu_name": "delayMicroseconds",
                "category": "Время",
                "fields": [
                    {
                        "name": "us",
                        "placeholder": "Микросекунды",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "delayMicroseconds(%us%);",
                "workspace": false,
            },
            {
                "block_name": "set_millis",
                "menu_name": "Присвоить millis()",
                "category": "Время",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = millis();",
                "workspace": false,
            },
            {
                "block_name": "set_micros",
                "menu_name": "Присвоить micros()",
                "category": "Время",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = micros();",
                "workspace": false,
            },

            {
                "block_name": "serial_begin",
                "menu_name": "Serial.begin",
                "category": "Serial",
                "fields": [
                    {
                        "name": "baud",
                        "placeholder": "Скорость (baud)",
                        "type": 1,
                        "hardcoded": true,
                        "values": [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200]
                    }
                ],
                "default_code": "Serial.begin(%baud%);",
                "workspace": false,
            },
            {
                "block_name": "serial_print",
                "menu_name": "Serial.print/println",
                "category": "Serial",
                "fields": [
                    {
                        "name": "method",
                        "placeholder": "Метод",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["print", "println"]
                    },
                    {
                        "name": "value",
                        "placeholder": "Значение (например \"Привет\" или x)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "Serial.%method%(%value%);",
                "workspace": false,
            },
            {
                "block_name": "serial_write",
                "menu_name": "Serial.write",
                "category": "Serial",
                "fields": [
                    {
                        "name": "value",
                        "placeholder": "Байт/массив/строка",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "Serial.write(%value%);",
                "workspace": false,
            },
            {
                "block_name": "serial_read_into",
                "menu_name": "Прочитать Serial.read() в переменную",
                "category": "Serial",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = Serial.read();",
                "workspace": false,
            },
            {
                "block_name": "if_serial_available",
                "menu_name": "Если Serial.available() > 0",
                "category": "Serial",
                "fields": [
                    {
                        "name": "if-body",
                        "placeholder": "Тогда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "if (Serial.available() > 0) {%n%%tab%%if-body%%n%%-tab%}",
                "workspace": false,
            },
            {
                "block_name": "serial_flush",
                "menu_name": "Serial.flush",
                "category": "Serial",
                "fields": [],
                "default_code": "Serial.flush();",
                "workspace": false,
            },

            {
                "block_name": "math_map",
                "menu_name": "map() в переменную",
                "category": "Математика",
                "fields": [
                    {
                        "name": "out",
                        "placeholder": "Куда сохранить",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "x",
                        "placeholder": "x",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "in_min",
                        "placeholder": "in_min",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "in_max",
                        "placeholder": "in_max",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "out_min",
                        "placeholder": "out_min",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "out_max",
                        "placeholder": "out_max",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%out% = map(%x%, %in_min%, %in_max%, %out_min%, %out_max%);",
                "workspace": false,
            },
            {
                "block_name": "math_constrain",
                "menu_name": "constrain() в переменную",
                "category": "Математика",
                "fields": [
                    {
                        "name": "out",
                        "placeholder": "Куда сохранить",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "x",
                        "placeholder": "x",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "a",
                        "placeholder": "Минимум",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "b",
                        "placeholder": "Максимум",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%out% = constrain(%x%, %a%, %b%);",
                "workspace": false,
            },
            {
                "block_name": "math_random",
                "menu_name": "random() в переменную",
                "category": "Математика",
                "fields": [
                    {
                        "name": "out",
                        "placeholder": "Куда сохранить",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "min",
                        "placeholder": "min",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "max",
                        "placeholder": "max",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%out% = random(%min%, %max%);",
                "workspace": false,
            },

            {
                "block_name": "function_void",
                "menu_name": "Функция void",
                "category": "Функции",
                "fields": [
                    {
                        "name": "func-name",
                        "placeholder": "Имя функции",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "func-body",
                        "placeholder": "Тело функции",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "void %func-name%() {%n%%tab%%func-body%%n%%-tab%}",
                "workspace": false,
            },
            {
                "block_name": "function_typed",
                "menu_name": "Функция (с типом)",
                "category": "Функции",
                "fields": [
                    {
                        "name": "func-type",
                        "placeholder": "Тип",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["int", "long", "float", "double", "bool", "char", "String", "void"]
                    },
                    {
                        "name": "func-name",
                        "placeholder": "Имя функции",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "func-body",
                        "placeholder": "Тело функции",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%func-type% %func-name%() {%n%%tab%%func-body%%n%%-tab%}",
                "workspace": false,
            },
            {
                "block_name": "return_value",
                "menu_name": "return (значение)",
                "category": "Функции",
                "fields": [
                    {
                        "name": "ret-value",
                        "placeholder": "Значение (например x)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "return %ret-value%;",
                "workspace": false,
            },
            {
                "block_name": "return_void",
                "menu_name": "return",
                "category": "Функции",
                "fields": [],
                "default_code": "return;",
                "workspace": false,
            }
        ]
    };
}