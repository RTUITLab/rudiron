import React, { useEffect, useState } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("python", python);

type CodeBlockProps = {
    code: string;
    language?: string;
};

export default function SimpleCode({ code, language = "python" }: CodeBlockProps) {
    const [html, setHtml] = useState("");

    useEffect(() => {
        const highlighted = hljs.highlight(code, { language }).value;
        setHtml(highlighted);
    }, [code, language]);

    return (
        <pre style={{background: "black", padding: "10px", borderRadius: "10px", textAlign: "start"}}>
          <code
              className={`language-${language}`}
              dangerouslySetInnerHTML={{ __html: html }}
          />
    </pre>
    );
};
