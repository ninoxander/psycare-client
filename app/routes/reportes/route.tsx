"use client"

import { json } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { useState } from "react"
import { createCookie } from "@remix-run/node"
import ReporteExitoso from "~/components/reporte-exitoso"

const authCookie = createCookie("auth", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
})

export async function loader({ request }) {
    const cookieHeader = request.headers.get("Cookie")
    const cookie = await authCookie.parse(cookieHeader)

    if (!cookie || !cookie.token) {
        return json({ isAuthenticated: false })
    }

    return json({
        isAuthenticated: true,
        token: cookie.token,
    })
}

export async function action({ request }) {
    const cookieHeader = request.headers.get("Cookie")
    const cookie = await authCookie.parse(cookieHeader)

    const formData = await request.formData()
    const reason = formData.get("reason")
    const body = formData.get("body")
    const page = formData.get("page")

    const errors = {}

    if (!reason) errors.reason = "El motivo es requerido"
    if (!body) errors.body = "La descripción es requerida"
    if (!page) errors.page = "La página es requerida"

    if (Object.keys(errors).length > 0) {
        return json({ errors })
    }

    try {
        const headers = {
            "Content-Type": "application/json",
        }

        // Añadir token de autenticación si está disponible
        if (cookie?.token) {
            headers["Authorization"] = `Bearer ${cookie.token}`
        }

        const response = await fetch("http://localhost:3000/reports", {
            method: "POST",
            headers,
            body: JSON.stringify({
                reason,
                body,
                page,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            return json({
                errors: { form: errorData.message || "Error al enviar el reporte" },
            })
        }

        const reportData = await response.json()

        // Retornar los datos del reporte para mostrar el mensaje de éxito
        return json({
            success: true,
            report: reportData,
        })
    } catch (error) {
        return json({
            errors: { form: "Error de conexión. Intenta de nuevo más tarde." },
        })
    }
}

export default function Reportes() {
    const actionData = useActionData()
    const navigation = useNavigation()
    const isSubmitting = navigation.state === "submitting"

    const [paginaSeleccionada, setPaginaSeleccionada] = useState(actionData?.report?.page || "")

    // Lista de páginas comunes para reportar
    const paginasComunes = [
        { value: "/login", label: "Página de inicio de sesión" },
        { value: "/registro", label: "Página de registro" },
        { value: "/perfil", label: "Perfil de usuario" },
        { value: "/dashboard", label: "Dashboard" },
        { value: "/otra", label: "Otra página" },
    ]

    const handlePaginaChange = (e) => {
        setPaginaSeleccionada(e.target.value)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-teal-700">Reportar un problema</h1>
                        </div>

                        {actionData?.success ? (
                            <ReporteExitoso report={actionData.report} />
                        ) : (
                            <Form method="post" className="space-y-6">
                                {actionData?.errors?.form && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                        {actionData.errors.form}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">
                                        Motivo del reporte
                                    </label>
                                    <input
                                        id="reason"
                                        name="reason"
                                        type="text"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Ej: Error en la página de inicio"
                                    />
                                    {actionData?.errors?.reason && (
                                        <p className="mt-1 text-sm text-red-600">{actionData.errors.reason}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="page" className="block text-sm font-medium text-slate-700 mb-1">
                                        Página donde ocurrió el problema
                                    </label>
                                    <div className="flex flex-col space-y-3">
                                        <select
                                            id="page"
                                            name="page"
                                            value={paginaSeleccionada}
                                            onChange={handlePaginaChange}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-white"
                                        >
                                            <option value="" disabled>
                                                Selecciona una página
                                            </option>
                                            {paginasComunes.map((pagina) => (
                                                <option key={pagina.value} value={pagina.value}>
                                                    {pagina.label}
                                                </option>
                                            ))}
                                        </select>

                                        {paginaSeleccionada === "/otra" && (
                                            <input
                                                type="text"
                                                name="page"
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                                placeholder="Escribe la URL de la página"
                                            />
                                        )}
                                    </div>
                                    {actionData?.errors?.page && <p className="mt-1 text-sm text-red-600">{actionData.errors.page}</p>}
                                </div>

                                <div>
                                    <label htmlFor="body" className="block text-sm font-medium text-slate-700 mb-1">
                                        Descripción del problema
                                    </label>
                                    <textarea
                                        id="body"
                                        name="body"
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none"
                                        placeholder="Describe detalladamente el problema que encontraste..."
                                    />
                                    {actionData?.errors?.body && <p className="mt-1 text-sm text-red-600">{actionData.errors.body}</p>}
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <a
                                        href="/"
                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:outline-none text-sm font-medium"
                                    >
                                        Cancelar
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:outline-none text-sm font-medium"
                                    >
                                        {isSubmitting ? "Enviando..." : "Enviar reporte"}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-slate-500">
                    <p>
                        ¿Necesitas ayuda?{" "}
                        <a href="/ayuda" className="text-teal-600 hover:text-teal-700 font-medium">
                            Contacta con soporte
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

