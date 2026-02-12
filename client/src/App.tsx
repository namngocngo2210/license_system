import React, { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Categories from './components/Categories';
import Licenses from './components/Licenses';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const token = localStorage.getItem('token');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mb-4"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="h-6 w-6" />
                </Button>
                {children}
            </main>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/licenses" element={<ProtectedRoute><Licenses /></ProtectedRoute>} />
            </Routes>
            <ToastContainer position="bottom-right" theme="light" />
        </BrowserRouter>
    );
};

export default App;
