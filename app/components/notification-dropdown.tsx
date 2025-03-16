"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "@remix-run/react"
import { format, isToday, isYesterday } from "date-fns"
import { es } from "date-fns/locale"

interface Notification {
    id: number
    title: string
    message: string
    read: boolean
    created_at: string
    link?: string
    type?: string
}

interface NotificationDropdownProps {
    notifications: Notification[]
    token: string
    onUpdate: (notifications: Notification[]) => void
}

export default function NotificationDropdown({ notifications, token, onUpdate }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)

        // Si hay notificaciones no leídas, marcarlas como leídas cuando se abre el dropdown
        if (isOpen === false && unreadCount > 0) {
            markAllAsRead()
        }
    }

    // Cerrar el dropdown cuando se hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Contar notificaciones no leídas
    const unreadCount = notifications.filter((notification) => !notification.read).length

    // Marcar todas las notificaciones como leídas
    const markAllAsRead = async () => {
        try {
            const response = await fetch("http://localhost:3000/notifications/read-all", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Actualizar el estado local de las notificaciones
                const updatedNotifications = notifications.map((notification) => ({
                    ...notification,
                    read: true,
                }))

                onUpdate(updatedNotifications)
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error)
        }
    }

    // Marcar una notificación específica como leída
    const markAsRead = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3000/notifications/${id}/read`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                // Actualizar el estado local de las notificaciones
                const updatedNotifications = notifications.map((notification) =>
                    notification.id === id ? { ...notification, read: true } : notification,
                )

                onUpdate(updatedNotifications)
            }
        } catch (error) {
            console.error(`Error marking notification ${id} as read:`, error)
        }
    }

    // Formatear la fecha de la notificación
    const formatNotificationDate = (dateString: string) => {
        const date = new Date(dateString)

        if (isToday(date)) {
            return `Hoy, ${format(date, "HH:mm", { locale: es })}`
        } else if (isYesterday(date)) {
            return `Ayer, ${format(date, "HH:mm", { locale: es })}`
        } else {
            return format(date, "d MMM, HH:mm", { locale: es })
        }
    }

    // Obtener el icono según el tipo de notificación
    const getNotificationIcon = (type?: string) => {
        switch (type) {
            case "success":
                return (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-green-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )
            case "warning":
                return (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-amber-500"
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
                    </div>
                )
            case "error":
                return (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )
            default:
                return (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg
                            className="w-4 h-4 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                )
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-1 rounded-full text-slate-600 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 relative"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className="sr-only">Ver notificaciones</span>
                <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    tabIndex={-1}
                >
                    <div className="py-2">
                        <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-slate-800">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-xs text-teal-600 hover:text-teal-800">
                                    Marcar todas como leídas
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-sm text-slate-500">No tienes notificaciones</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 hover:bg-slate-50 ${!notification.read ? "bg-blue-50" : ""}`}
                                    >
                                        <div className="flex items-start">
                                            {getNotificationIcon(notification.type)}

                                            <div className="ml-3 flex-1">
                                                <div className="flex justify-between items-baseline">
                                                    <p
                                                        className={`text-sm font-medium ${!notification.read ? "text-slate-900" : "text-slate-700"}`}
                                                    >
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-xs text-slate-500">
                                                        {formatNotificationDate(notification.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">{notification.message}</p>

                                                <div className="mt-2 flex justify-between items-center">
                                                    {notification.link && (
                                                        <Link
                                                            to={notification.link}
                                                            className="text-xs text-teal-600 hover:text-teal-800"
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            Ver detalles
                                                        </Link>
                                                    )}

                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-xs text-slate-500 hover:text-slate-700"
                                                        >
                                                            Marcar como leída
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-slate-100 text-center">
                                <Link
                                    to="/notificaciones"
                                    className="text-sm text-teal-600 hover:text-teal-800"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Ver todas las notificaciones
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

