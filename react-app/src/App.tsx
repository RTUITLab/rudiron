import React, { FC } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import AppPage from "./pages/App";
import WorkflowPage from "./pages/Workflow";
import ProtectedRoute from "./components/ProtectedRoute";

const App: FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <AppPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/workflow"
                    element={
                        <ProtectedRoute>
                            <WorkflowPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/app" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;