export default function generatorCode(codeFormat: string): string {
    codeFormat = codeFormat.replace(/%n%/g, '\n');
    const result: string[] = [];
    let tabs = 0;

    const lines = codeFormat.split('\n');
    for (let line of lines) {
        if (line.includes('%tab%')) {
            tabs++;
            line = line.replace(/%tab%/g, '');
        }

        if (line.includes('%-tab%')) {
            tabs = Math.max(0, tabs - 1);
            line = line.replace(/%-tab%/g, '');
        }

        if (tabs > 0) {
            line = '    '.repeat(tabs) + line;
        }

        result.push(line);
    }

    const formatted = result.join('\n');
    console.log("📜 Generated code:\n" + formatted);
    return formatted;
}
