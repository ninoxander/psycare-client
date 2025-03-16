import { useState, useEffect } from "react"
import { Link, useLoaderData } from "@remix-run/react"
import UserDropdown from "~/components/user-dropdown"
import NotificationDropdown from "~/components/notification-dropdown"
import SearchBar from "~/components/search-bar"
import { createCookie } from "@remix-run/node"




// Definición de tipos
interface NavbarProps {
    token?: string
}

export default function Navbar({ token }: NavbarProps) {
    // const { navbarData = [] } = useLoaderData();
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) return

            setIsLoading(true)
            try {
                const response = await fetch("http://localhost:3000/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData)
                }
            } catch (error) {
                console.error("Error fetching user data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        const fetchNotifications = async () => {
            if (!token) return

            try {
                const response = await fetch("http://localhost:3000/notifications", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const notificationsData = await response.json()
                    setNotifications(notificationsData)
                }
            } catch (error) {
                console.error("Error fetching notifications:", error)
            }
        }

        fetchUserData()
        fetchNotifications()
    }, [token])

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-teal-600">
                                <i className="fa-solid fa-brain"></i> PsyCare
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-transparent text-slate-500 hover:border-teal-500 hover:text-teal-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Inicio
                            </Link>
                            <Link
                                to="/dashboard"
                                className="border-transparent text-slate-500 hover:border-teal-500 hover:text-teal-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/reportes"
                                className="border-transparent text-slate-500 hover:border-teal-500 hover:text-teal-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Reportes
                            </Link>
                        </div>
                    </div>

                    {/* Componente de búsqueda en el centro */}
                    <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
                        {token && <SearchBar token={token} />}
                    </div>

                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        {token && (
                            <>
                                <NotificationDropdown
                                    notifications={notifications}
                                    token={token}
                                    onUpdate={(updatedNotifications) => setNotifications(updatedNotifications)}
                                />
                                <UserDropdown user={user} isLoading={isLoading} />
                            </>
                        )}

                        {!token && (
                            <div className="flex space-x-2">
                                <Link
                                    to="/login"
                                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/registro"
                                    className="px-3 py-2 rounded-md text-sm font-medium bg-teal-600 text-white hover:bg-teal-700"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Abrir menú principal</span>
                            {/* Icono de menú */}
                            {!isMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            {isMenuOpen && (
                <div className="sm:hidden">
                    {/* Barra de búsqueda en móvil */}
                    {token && (
                        <div className="px-4 pt-2 pb-3">
                            <SearchBar token={token} isMobile={true} />
                        </div>
                    )}

                    <div className="pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-teal-500 hover:text-teal-700"
                        >
                            Inicio
                        </Link>
                        <Link
                            to="/dashboard"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-teal-500 hover:text-teal-700"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/reportes"
                            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-teal-500 hover:text-teal-700"
                        >
                            Reportes
                        </Link>
                    </div>

                    {token ? (
                        <div className="pt-4 pb-3 border-t border-slate-200">
                            {user && (
                                <div className="flex items-center px-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium">
                                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                        </div>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-slate-800">{user.name}</div>
                                        <div className="text-sm font-medium text-slate-500">{user.email}</div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 space-y-1">
                                <Link
                                    to="/perfil"
                                    className="block px-4 py-2 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-teal-700"
                                >
                                    Tu perfil
                                </Link>
                                <Link
                                    to="/profile/edit"
                                    className="block px-4 py-2 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-teal-700"
                                >
                                    Configuración
                                </Link>
                                <form action="/logout" method="post">
                                    <button
                                        type="submit"
                                        className="block w-full text-left px-4 py-2 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-teal-700"
                                    >
                                        Cerrar sesión
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-3 border-t border-slate-200">
                            <div className="space-y-1 px-4">
                                <Link
                                    to="/login"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    to="/registro"
                                    className="block px-3 py-2 rounded-md text-base font-medium bg-teal-600 text-white hover:bg-teal-700 text-center"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

export async function getNavbarData(request) {
    const authCookie = createCookie("auth", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        path: "/",
    })

    const cookieHeader = request.headers.get("Cookie")
    const cookie = await authCookie.parse(cookieHeader)

    return {
        token: cookie?.token || null,
    }
}

