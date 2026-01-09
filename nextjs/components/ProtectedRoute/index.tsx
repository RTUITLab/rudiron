"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getUserToken } from "@/services/auth";

interface Props {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = getUserToken();

        if (!token) {
            router.replace("/login");
        } else {
            setIsAuthenticated(true);
        }

        setIsAuthChecked(true);
    }, [router]);

    if (!isAuthChecked) return null;
    if (!isAuthenticated) return null;

    return <>{children}</>;
}
