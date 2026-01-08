import { createContext, useContext, useState, ReactNode } from "react";

interface Variable {
    name: string;
    type: string;
}

interface VariablesContextType {
    variables: Variable[];
    addVariable: (name: string, type: string) => void;
    removeVariable: (name: string) => void;
    updateVariable: (oldName: string, newName: string, type: string) => void;
}

const VariablesContext = createContext<VariablesContextType>({
    variables: [],
    addVariable: () => {},
    removeVariable: () => {},
    updateVariable: () => {},
});

export const VariablesProvider = ({ children }: { children: ReactNode }) => {
    const [variables, setVariables] = useState<Variable[]>([]);

    const addVariable = (name: string, type: string) => {
        setVariables((prev) => {
            if (prev.some(v => v.name === name)) {
                return prev;
            }
            const newVariables = [...prev, { name, type }];
            return newVariables;
        });
    };

    const removeVariable = (name: string) => {
        setVariables((prev) => {
            const newVariables = prev.filter(v => v.name !== name);
            return newVariables;
        });
    };

    const updateVariable = (oldName: string, newName: string, type: string) => {
        setVariables((prev) => {
            if (oldName === newName) {
                const newVariables = prev.map(v => v.name === oldName ? { name: newName, type } : v);
                return newVariables;
            }
            if (prev.some(v => v.name === newName && v.name !== oldName)) {
                const newVariables = prev.filter(v => v.name !== oldName);
                return newVariables;
            }
            const newVariables = prev.map(v => v.name === oldName ? { name: newName, type } : v);
            return newVariables;
        });
    };

    return (
        <VariablesContext.Provider value={{ variables, addVariable, removeVariable, updateVariable }}>
            {children}
        </VariablesContext.Provider>
    );
};

export const useVariables = () => {
    const context = useContext(VariablesContext);
    if (!context) {
        throw new Error("useVariables must be used within VariablesProvider");
    }
    return context;
};

