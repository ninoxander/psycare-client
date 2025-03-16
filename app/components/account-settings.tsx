"use client"

import type React from "react"

import { useState } from "react"
import { Form } from "@remix-run/react"

interface AccountSettingsProps {
    token: string
    userId: number
}

export default function AccountSettings({ token, userId }: AccountSettingsProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordErrors, setPasswordErrors] = useState<{
        currentPassword?: string
        newPassword?: string
        confirmPassword?: string
        form?: string
    }>({})
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        // Reset states
        setPasswordErrors({})
        setPasswordSuccess(false)

        // Validate form
        const errors: { [key: string]: string } = {}

        if (!passwordFormData.currentPassword) {
            errors.currentPassword = "La contraseña actual es requerida"
        }

        if (!passwordFormData.newPassword) {
            errors.newPassword = "La nueva contraseña es requerida"
        } else if (passwordFormData.newPassword.length < 8) {
            errors.newPassword = "La contraseña debe tener al menos 8 caracteres"
        }

        if (!passwordFormData.confirmPassword) {
            errors.confirmPassword = "Confirma tu nueva contraseña"
        } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            errors.confirmPassword = "Las contraseñas no coinciden"
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors)
            return
        }

        // Submit password change
        try {
            const response = await fetch("http://localhost:3000/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordFormData.currentPassword,
                    newPassword: passwordFormData.newPassword,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                setPasswordErrors({
                    form: errorData.message || "Error al cambiar la contraseña",
                })
                return
            }

            // Reset form and show success message
            setPasswordFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setPasswordSuccess(true)
        } catch (error) {
            setPasswordErrors({
                form: "Error de conexión. Intenta de nuevo más tarde.",
            })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPasswordFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-teal-700 mb-6">Configuración de la cuenta</h2>

                {/* Cambio de contraseña */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-slate-700 mb-4">Cambiar contraseña</h3>

                    {passwordSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                            Tu contraseña ha sido actualizada exitosamente.
                        </div>
                    )}

                    {passwordErrors.form && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {passwordErrors.form}
                        </div>
                    )}

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                Contraseña actual
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={passwordFormData.currentPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                placeholder="Ingresa tu contraseña actual"
                            />
                            {passwordErrors.currentPassword && (
                                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                Nueva contraseña
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={passwordFormData.newPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                placeholder="Ingresa tu nueva contraseña"
                            />
                            {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                Confirmar nueva contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={passwordFormData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                placeholder="Confirma tu nueva contraseña"
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:outline-none text-sm font-medium"
                            >
                                Cambiar contraseña
                            </button>
                        </div>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-medium text-red-600 mb-4">Zona de peligro</h3>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-base font-medium text-red-700 mb-2">Eliminar cuenta</h4>
                        <p className="text-sm text-red-600 mb-4">
                            Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos y no podrás recuperarlos.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-4 py-2 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none text-sm font-medium"
                            >
                                Eliminar mi cuenta
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm font-medium text-red-700">
                                    ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
                                </p>

                                <Form method="post" action="/account/delete">
                                    <input type="hidden" name="userId" value={userId} />
                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:outline-none text-sm font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            name="intent"
                                            value="delete-account"
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none text-sm font-medium"
                                        >
                                            Sí, eliminar mi cuenta
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

