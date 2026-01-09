// VariableContext.tsx
import React, { createContext, useContext, useState } from "react";
// import '@/vars.css';
// import '@/../style/vars.css';

interface Variable {
    id: string;
    name: string;
}

interface VariableContextProps {
    variables: Variable[];
    updateVariable: (id: string, name: string) => void;
}

const VariableContext = createContext<VariableContextProps | null>(null);

export const VariableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [variables, setVariables] = useState<Variable[]>([]);

    const updateVariable = (id: string, name: string) => {
        setVariables((prev) => {
            const index = prev.findIndex((variable) => variable.id === id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = { id, name };
                return updated;
            }
            return [...prev, { id, name }];
        });
    };

    return (
        <VariableContext.Provider value={{ variables, updateVariable }}>
            {children}
        </VariableContext.Provider>
    );
};

export const useVariableContext = () => {
    const context = useContext(VariableContext);
    if (!context) {
        throw new Error("useVariableContext must be used within a VariableProvider");
    }
    return context;
};

export default VariableContext;