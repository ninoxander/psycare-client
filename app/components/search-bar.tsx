import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "@remix-run/react"

interface SearchCategory {
    id: string
    title: string
    icon: React.ReactNode
    results: SearchResult[]
}

interface SearchResult {
    id: string
    title: string
    url: string
}

interface SearchBarProps {
    token: string
    isMobile?: boolean
}

export default function SearchBar({ token, isMobile = false }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchResults, setSearchResults] = useState<SearchCategory[]>([])
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    // Cerrar el dropdown cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Simular búsqueda cuando el usuario escribe
    useEffect(() => {
        console.log("searchTerm cambió:", searchTerm); // Depuración
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length >= 2) {
                performSearch(searchTerm)
            } else {
                console.log("Búsqueda cancelada (término demasiado corto)"); // Depuración
                setSearchResults([])
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, token])

    const performSearch = async (query: string) => {
        setIsLoading(true)
        
        await new Promise((resolve) => setTimeout(resolve, 500))

        const results: SearchCategory[] = [
            {
                id: "general",
                title: "Búsqueda general",
                icon: (
                    <svg
                        className="w-5 h-5 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                ),
                results: [
                    { id: "g1", title: `Resultados para "${query}"`, url: `/search?q=${encodeURIComponent(query)}` },
                    {
                        id: "g2",
                        title: `Buscar "${query}" en todos los registros`,
                        url: `/search/all?q=${encodeURIComponent(query)}`,
                    },
                ],
            },
            {
                id: "habits",
                title: "Buscar en hábitos",
                icon: (
                    <svg
                        className="w-5 h-5 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                ),
                results: [
                    { id: "h1", title: `Hábito: ${query}`, url: `/habits/search?q=${encodeURIComponent(query)}` },
                    { id: "h2", title: `Registro de hábitos con ${query}`, url: `/habits/log?q=${encodeURIComponent(query)}` },
                ],
            },
            {
                id: "alerts",
                title: "Buscar en alertas",
                icon: (
                    <svg
                        className="w-5 h-5 text-amber-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                ),
                results: [
                    { id: "a1", title: `Alerta: ${query}`, url: `/alerts/search?q=${encodeURIComponent(query)}` },
                    {
                        id: "a2",
                        title: `Configuración de alertas para ${query}`,
                        url: `/alerts/settings?q=${encodeURIComponent(query)}`,
                    },
                ],
            },
            {
                id: "contacts",
                title: "Buscar en contactos",
                icon: (
                    <svg
                        className="w-5 h-5 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                ),
                results: [
                    { id: "c1", title: `Contacto: ${query}`, url: `/contacts/search?q=${encodeURIComponent(query)}` },
                    {
                        id: "c2",
                        title: `Directorio de contactos con ${query}`,
                        url: `/contacts/directory?q=${encodeURIComponent(query)}`,
                    },
                ],
            },
        ]

        setSearchResults(results)
        setIsLoading(false)
        setIsOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("WORKING");
        setSearchTerm(e.target.value)
    }

    const handleInputFocus = () => {
        if (searchTerm.length >= 2) {
            setIsOpen(true)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            if (searchTerm.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
                setIsOpen(false)
            }
        }
    }

    const handleResultClick = () => {
        setIsOpen(false)
        setSearchTerm("")
    }

    return (
        <div className={`relative ${isMobile ? "w-full" : "w-full max-w-md"}`} ref={searchRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-slate-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md leading-5 text-black bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    aria-label="Buscar en la aplicación"
                />
                {searchTerm && (
                    <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => {
                            setSearchTerm("")
                            setIsOpen(false)
                            inputRef.current?.focus()
                        }}
                    >
                        <svg
                            className="h-5 w-5 text-slate-400 hover:text-slate-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown de resultados */}
            {isOpen && (
                <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg max-h-96 overflow-y-auto z-10 border border-slate-200">
                    {isLoading ? (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                            <p className="text-sm text-slate-500 mt-2">Buscando...</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {searchResults.length > 0 ? (
                                searchResults.map((category) => (
                                    <div key={category.id} className="px-2">
                                        <div className="px-3 py-2 text-xs font-semibold text-slate-500 flex items-center">
                                            {category.icon}
                                            <span className="ml-2">{category.title}</span>
                                        </div>
                                        <ul>
                                            {category.results.map((result) => (
                                                <li key={result.id}>
                                                    <Link
                                                        to={result.url}
                                                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-md mx-1"
                                                        onClick={handleResultClick}
                                                    >
                                                        {result.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="border-b border-slate-100 my-1"></div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-sm text-slate-500">No se encontraron resultados para "{searchTerm}"</p>
                                </div>
                            )}

                            {/* Pie del dropdown */}
                            <div className="px-3 py-2 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
                                <span>Presiona Enter para buscar</span>
                                <Link
                                    to={`/search/advanced?q=${encodeURIComponent(searchTerm)}`}
                                    className="text-teal-600 hover:text-teal-800 font-medium"
                                    onClick={handleResultClick}
                                >
                                    Búsqueda avanzada
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

