import {useCallback, useState} from "react";
import copy from 'copy-to-clipboard';

export const useClipboard = () => {
    const [isCopied, setIsCopied] = useState(false);
    const [lastCopiedText, setLastCopiedText] = useState('');

    const copying = useCallback((text: string) => {
        if (!text || text.trim() === '') {
            return false;
        }

        const success = copy(text);
        if (success) {
            setIsCopied(true);
            setLastCopiedText(text);
            setTimeout(() => setIsCopied(false), 2000);
        }
        return success;
    }, []);

    return { copying, isCopied, lastCopiedText };
};