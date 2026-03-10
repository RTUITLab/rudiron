/**
 * Преобразует код с метками (%n%, %tab%, %-tab%) в форматированный Python-код
 * с корректными отступами и переносами строк.
 */
export default function generatorCode(rawCode: string): string {
    if (!rawCode) return "";

    // Заменяем %n% на перенос строки
    let code = rawCode.replace(/%n%/g, "\n");

    // Разбиваем по строкам
    const lines = code.split("\n");
    const formatted: string[] = [];

    let indent = 0;

    for (let line of lines) {
        // Сначала проверяем на %-tab% для уменьшения отступа
        while (line.includes("%-tab%")) {
            line = line.replace(/%-tab%/, "");
            indent = Math.max(0, indent - 1);
        }

        // Удаляем все %tab% метки и считаем их
        let tabCount = 0;
        while (line.includes("%tab%")) {
            line = line.replace(/%tab%/, "");
            tabCount++;
        }

        // Применяем текущий отступ (но только если строка не пустая)
        if (line.trim() !== "") {
            const indentedLine = "    ".repeat(indent) + line.trimEnd();
            formatted.push(indentedLine);
        } else if (line === "") {
            // Сохраняем пустые строки как есть (без отступов)
            formatted.push("");
        }

        // Увеличиваем уровень отступа после строки
        indent += tabCount;
    }

    // Объединяем и убираем множественные пустые строки (но оставляем одну)
    return formatted
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}