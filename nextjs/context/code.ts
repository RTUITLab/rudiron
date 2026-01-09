import {createContext} from "react";

export interface CodeType {
    id: number;
    code: string;
    children: CodeType[];
}

const CodeContext = createContext<{value: CodeType[], updateData: (newData: CodeType,  operation: "set" | "delete") => void}>({value: [], updateData: () => {}});

export default CodeContext;