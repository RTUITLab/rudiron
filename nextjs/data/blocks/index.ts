import {BlocksData} from "@/types/blocks";

export default function blocksData(): BlocksData {
    return {
        blocks: [
            {
                "block_name": "micropython_script",
                "menu_name": "Скрипт MicroPython",
                "category": "Структура",
                "fields": [
                    {
                        "name": "imports-body",
                        "placeholder": "Импорты (import) — перетащите блоки сюда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "globals-body",
                        "placeholder": "Глобальные переменные — перетащите блоки сюда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "functions-body",
                        "placeholder": "Функции — перетащите блоки сюда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "main-body",
                        "placeholder": "Основной код — выполняется при запуске",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%imports-body%%n%%globals-body%%n%%functions-body%%n%%n%# Основной код%n%if __name__ == '__main__':%n%%tab%%main-body%%n%%-tab%",
                "workspace": true,
            },
            {
                "block_name": "import_module",
                "menu_name": "import модуль",
                "category": "Структура",
                "fields": [
                    {
                        "name": "module-name",
                        "placeholder": "Например: machine, time, network",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "import %module-name%",
                "workspace": false,
            },
            {
                "block_name": "from_import",
                "menu_name": "from X import Y",
                "category": "Структура",
                "fields": [
                    {
                        "name": "module-name",
                        "placeholder": "Модуль (например: machine, time)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "import-what",
                        "placeholder": "Что импортировать (например: Pin, PWM)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "from %module-name% import %import-what%",
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
                "default_code": "# %comment-text%",
                "workspace": false,
            },
            {
                "block_name": "create_variable",
                "menu_name": "Объявить переменную",
                "category": "Переменные",
                "fields": [
                    {
                        "name": "var-name",
                        "placeholder": "Введите название",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "var-value",
                        "placeholder": "Значение (опционально)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var-name% = %var-value%",
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
                        "placeholder": "Значение/выражение",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%set-var% = %set-value%",
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
                        "values": ["+= 1", "-= 1", "*= 2", "/= 2"]
                    },
                ],
                "default_code": "%inc-var% %inc-op%",
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
                        "values": [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33]
                    },
                    {
                        "name": "if-button",
                        "placeholder": "Сигнал",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["1", "0"]
                    },
                    {
                        "name": "if-body",
                        "placeholder": "Тогда (перетащите блоки сюда)",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "if pin%if-pin%.value() == %if-button%:%n%%tab%%if-body%%n%%-tab%",
                "workspace": false,
            },
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
                "default_code": "if %if-cond%:%n%%tab%%if-body%%n%%-tab%",
                "workspace": false,
            },
            {
                "block_name": "if_else_condition",
                "menu_name": "Если/иначе",
                "category": "Условия",
                "fields": [
                    {
                        "name": "if-cond",
                        "placeholder": "Условие",
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
                "default_code": "if %if-cond%:%n%%tab%%if-body%%n%%-tab%else:%n%%tab%%else-body%%n%%-tab%",
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
                        "name": "for-range",
                        "placeholder": "Диапазон (например range(10))",
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
                "default_code": "for %for-i% in %for-range%:%n%%tab%%for-body%%n%%-tab%",
                "workspace": false,
            },
            {
                "block_name": "while_loop",
                "menu_name": "Цикл while",
                "category": "Циклы",
                "fields": [
                    {
                        "name": "while-cond",
                        "placeholder": "Условие (например True)",
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
                "default_code": "while %while-cond%:%n%%tab%%while-body%%n%%-tab%",
                "workspace": false,
            },
            {
                "block_name": "break",
                "menu_name": "break",
                "category": "Циклы",
                "fields": [],
                "default_code": "break",
                "workspace": false,
            },
            {
                "block_name": "continue",
                "menu_name": "continue",
                "category": "Циклы",
                "fields": [],
                "default_code": "continue",
                "workspace": false,
            },

            {
                "block_name": "pin_setup",
                "menu_name": "Настройка пина",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33]
                    },
                    {
                        "name": "mode",
                        "placeholder": "Режим",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["Pin.OUT", "Pin.IN", "Pin.IN, Pin.PULL_UP"]
                    }
                ],
                "default_code": "pin%pin% = Pin(%pin%, %mode%)",
                "workspace": false,
            },
            {
                "block_name": "digital_write",
                "menu_name": "Цифровая запись",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "value",
                        "placeholder": "Значение",
                        "type": 1,
                        "hardcoded": true,
                        "values": ["1", "0"]
                    }
                ],
                "default_code": "%pin%.value(%value%)",
                "workspace": false,
            },
            {
                "block_name": "digital_read",
                "menu_name": "Цифровое чтение",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "var",
                        "placeholder": "Переменная для результата",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = %pin%.value()",
                "workspace": false,
            },
            {
                "block_name": "pwm_setup",
                "menu_name": "Настройка PWM",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [0, 2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33]
                    },
                    {
                        "name": "freq",
                        "placeholder": "Частота (Гц)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "pwm%pin% = PWM(Pin(%pin%), freq=%freq%)",
                "workspace": false,
            },
            {
                "block_name": "pwm_write",
                "menu_name": "PWM запись",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pwm",
                        "placeholder": "PWM объект",
                        "type": 1,
                        "hardcoded": true,
                        "values": [
                            "pwm0", "pwm2", "pwm4", "pwm5", "pwm12", "pwm13",
                            "pwm14", "pwm15", "pwm16", "pwm17", "pwm18", "pwm19",
                            "pwm21", "pwm22", "pwm23", "pwm25", "pwm26", "pwm27",
                            "pwm32", "pwm33"
                        ]
                    },
                    {
                        "name": "duty",
                        "placeholder": "Коэффициент заполнения 0-1023",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%pwm%.duty(%duty%)",
                "workspace": false,
            },
            {
                "block_name": "adc_setup",
                "menu_name": "Настройка ADC",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "pin",
                        "placeholder": "Аналоговый пин",
                        "type": 1,
                        "hardcoded": true,
                        "values": [32, 33, 34, 35, 36, 39]
                    }
                ],
                "default_code": "adc%pin% = ADC(Pin(%pin%))%n%adc%pin%.atten(ADC.ATTN_11DB)",
                "workspace": false,
            },
            {
                "block_name": "adc_read",
                "menu_name": "Аналоговое чтение",
                "category": "Ввод/Вывод",
                "fields": [
                    {
                        "name": "adc",
                        "placeholder": "ADC объект",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "var",
                        "placeholder": "Переменная для результата",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = %adc%.read()",
                "workspace": false,
            },

            {
                "block_name": "sleep",
                "menu_name": "sleep",
                "category": "Время",
                "fields": [
                    {
                        "name": "seconds",
                        "placeholder": "Секунды",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "time.sleep(%seconds%)",
                "workspace": false,
            },
            {
                "block_name": "sleep_ms",
                "menu_name": "sleep_ms",
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
                "default_code": "time.sleep_ms(%ms%)",
                "workspace": false,
            },
            {
                "block_name": "ticks_ms",
                "menu_name": "ticks_ms()",
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
                "default_code": "%var% = time.ticks_ms()",
                "workspace": false,
            },
            {
                "block_name": "ticks_diff",
                "menu_name": "Разница времени",
                "category": "Время",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная для результата",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "end",
                        "placeholder": "Конечное время",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "start",
                        "placeholder": "Начальное время",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = time.ticks_diff(%end%, %start%)",
                "workspace": false,
            },

            {
                "block_name": "uart_setup",
                "menu_name": "UART init",
                "category": "UART",
                "fields": [
                    {
                        "name": "baud",
                        "placeholder": "Скорость (baud)",
                        "type": 1,
                        "hardcoded": true,
                        "values": [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]
                    },
                    {
                        "name": "uart-num",
                        "placeholder": "UART номер",
                        "type": 1,
                        "hardcoded": true,
                        "values": [1, 2]
                    }
                ],
                "default_code": "uart%uart-num% = UART(%uart-num%, baudrate=%baud%)",
                "workspace": false,
            },
            {
                "block_name": "uart_write",
                "menu_name": "UART запись",
                "category": "UART",
                "fields": [
                    {
                        "name": "uart",
                        "placeholder": "UART объект",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "data",
                        "placeholder": "Данные для отправки",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%uart%.write(%data%)",
                "workspace": false,
            },
            {
                "block_name": "uart_read",
                "menu_name": "UART чтение",
                "category": "UART",
                "fields": [
                    {
                        "name": "uart",
                        "placeholder": "UART объект",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "var",
                        "placeholder": "Переменная для результата",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "bytes",
                        "placeholder": "Количество байт",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = %uart%.read(%bytes%)",
                "workspace": false,
            },
            {
                "block_name": "uart_any",
                "menu_name": "Если есть данные UART",
                "category": "UART",
                "fields": [
                    {
                        "name": "uart",
                        "placeholder": "UART объект",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "if-body",
                        "placeholder": "Тогда",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "if %uart%.any():%n%%tab%%if-body%%n%%-tab%",
                "workspace": false,
            },

            {
                "block_name": "function_def",
                "menu_name": "Функция def",
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
                        "name": "func-args",
                        "placeholder": "Аргументы (например a, b)",
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
                "default_code": "def %func-name%(%func-args%):%n%%tab%%func-body%%n%%-tab%",
                "workspace": false,
            },
            {
                "block_name": "function_return",
                "menu_name": "return",
                "category": "Функции",
                "fields": [
                    {
                        "name": "ret-value",
                        "placeholder": "Возвращаемое значение (опционально)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "return %ret-value%",
                "workspace": false,
            },
            {
                "block_name": "function_call",
                "menu_name": "Вызов функции",
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
                        "name": "func-args",
                        "placeholder": "Аргументы",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%func-name%(%func-args%)",
                "workspace": false,
            },

            {
                "block_name": "wifi_connect",
                "menu_name": "Подключение к WiFi",
                "category": "Сеть",
                "fields": [
                    {
                        "name": "ssid",
                        "placeholder": "SSID сети",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "password",
                        "placeholder": "Пароль",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "import network%n%wifi = network.WLAN(network.STA_IF)%n%wifi.active(True)%n%wifi.connect('%ssid%', '%password%')%n%while not wifi.isconnected():%n%%tab%time.sleep(1)%n%%-tab%",
                "workspace": false,
            },
            {
                "block_name": "wifi_status",
                "menu_name": "Статус WiFi",
                "category": "Сеть",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная для результата",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = wifi.isconnected()",
                "workspace": false,
            },

            {
                "block_name": "math_operation",
                "menu_name": "Математическая операция",
                "category": "Математика",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Результат",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "expression",
                        "placeholder": "Выражение (например a + b)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "%var% = %expression%",
                "workspace": false,
            },
            {
                "block_name": "random_int",
                "menu_name": "Случайное число",
                "category": "Математика",
                "fields": [
                    {
                        "name": "var",
                        "placeholder": "Переменная для результата",
                        "type": 1,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "min",
                        "placeholder": "Минимум",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "max",
                        "placeholder": "Максимум",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "import random%n%%var% = random.randint(%min%, %max%)",
                "workspace": false,
            },
            {
                "block_name": "import_machine_time",
                "menu_name": "Импорт machine/time",
                "category": "Структура",
                "fields": [],
                "default_code": "from machine import Pin, PWM, ADC, UART%n%import time",
                "workspace": false,
            },

            {
                "block_name": "print_text",
                "menu_name": "Вывод print()",
                "category": "Отладка",
                "fields": [
                    {
                        "name": "print-value",
                        "placeholder": "Что вывести (например: 'Hello' или переменную)",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "print(%print-value%)",
                "workspace": false,
            },

            {
                "block_name": "while_true",
                "menu_name": "Бесконечный цикл while True",
                "category": "Циклы",
                "fields": [
                    {
                        "name": "body",
                        "placeholder": "Тело цикла",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "while True:%n%%tab%%body%%n%%-tab%",
                "workspace": false,
            },

            {
                "block_name": "try_except",
                "menu_name": "try / except",
                "category": "Структура",
                "fields": [
                    {
                        "name": "try-body",
                        "placeholder": "Попробовать (try)",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    },
                    {
                        "name": "except-body",
                        "placeholder": "Если ошибка (except)",
                        "type": 2,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "try:%n%%tab%%try-body%%n%%-tab%except Exception as e:%n%%tab%%except-body%%n%%-tab%",
                "workspace": false,
            },

            {
                "block_name": "delay_ms",
                "menu_name": "Задержка (мс)",
                "category": "Время",
                "fields": [
                    {
                        "name": "delay",
                        "placeholder": "Миллисекунды",
                        "type": 3,
                        "hardcoded": false,
                        "values": []
                    }
                ],
                "default_code": "time.sleep_ms(%delay%)",
                "workspace": false,
            }
        ]
    };
}