import { useState, useRef, useEffect } from "react";
import { Form, Link } from "@remix-run/react";

interface User {
    name: string;
    email: string;
    user_id: number;
    bio?: string;
    pronouns?: string;
    avatar_url?: string;
}

interface UserDropdownProps {
    user: User | null;
    isLoading: boolean;
}

export default function UserDropdown({ user, isLoading }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Cerrar el dropdown cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse"></div>
        );
    }

    if (!user) {
        return null;
    }

    // Obtener las iniciales del nombre del usuario
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                id="user-menu-button"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="sr-only">Abrir menú de usuario</span>
                {user.avatar_url ? (
                    <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={`Foto de perfil de ${user.name}`}
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                        {getInitials(user.name)}
                    </div>
                )}
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                >
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                        to="/perfil"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => setIsOpen(false)}
                    >
                        Tu perfil
                    </Link>

                    <Link
                        to="/profile/edit"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => setIsOpen(false)}
                    >
                        Configuración
                    </Link>

                    <Form method="post" action="/logout">
                        <button
                            type="submit"
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            role="menuitem"
                            tabIndex={-1}
                            onClick={() => setIsOpen(false)}
                        >
                            Cerrar sesión
                        </button>
                    </Form>
                </div>
            )}
        </div>
    );
}
