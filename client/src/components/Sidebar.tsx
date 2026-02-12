import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Key, LogOut, Languages, LucideIcon } from 'lucide-react';
import { logout } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    to: string;
    icon: LucideIcon;
    label: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        await logout();
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const navItems: NavItem[] = [
        { to: "/", icon: Home, label: t('sidebar.dashboard') },
        { to: "/categories", icon: Grid, label: t('sidebar.categories') },
        { to: "/licenses", icon: Key, label: t('sidebar.licenses') },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen md:flex md:flex-col p-4",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Key className="h-6 w-6" /> LicenseSys
                    </h2>
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
                        <span className="sr-only">Close</span>
                        X
                    </Button>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-secondary text-secondary-foreground"
                                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                                )
                            }
                            onClick={() => onClose()}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <Separator />
                    <div className="flex items-center justify-between px-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
                                    <Languages className="h-4 w-4" />
                                    {i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                                    English
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => changeLanguage('vi')}>
                                    Tiếng Việt
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        {t('sidebar.logout')}
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
