

export default function generatorCode(codeFormat: string) {
    codeFormat = codeFormat.replace(/%n%/g, '\n');
    const result = [];
    let lines = codeFormat.split('\n');
    let tabs = 0;
    for (let line of lines) {
        if (line.includes('%tab%')) {
            tabs += 1;
            line = line.replace(/%tab%/g, '');
        }

        if (line.includes('%-tab%')) {
            tabs > 0 ? tabs -= 1 : tabs = 0;
            line = line.replace(/%-tab%/g, '');
        }

        if (tabs > 0) {
            line = '    '.repeat(tabs) + line;
        }
        result.push(line);
    }
    console.log(result);
}