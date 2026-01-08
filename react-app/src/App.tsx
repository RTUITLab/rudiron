import React, { FC } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import AppPage from "./pages/App";
import WorkflowPage from "./pages/Workflow";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import Main from "./pages/Main";

const App: FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Main/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                    path="/project/:id"
                    element={
                        <ProtectedRoute>
                            <Project/>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute>
                            <Projects />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;