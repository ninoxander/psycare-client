import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { useState } from "react"
import { createCookie } from "@remix-run/node"

export async function loader() {
    return json({ message: "Bienvenido a la página de login" });
}

const authCookie = createCookie("auth", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
})

export async function action({ request }) {
    const formData = await request.formData()
    const email = formData.get("email")
    const password = formData.get("password")

    const errors = {}

    if (!email) errors.email = "El correo electrónico es requerido"
    if (!password) errors.password = "La contraseña es requerida"

    if (Object.keys(errors).length > 0) {
        return json({ errors })
    }

    try {
        const response = await fetch("http://192.168.56.1:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            return json({
                errors: { form: errorData.message || "Credenciales incorrectas" },
            })
        }

        const data = await response.json()

        return redirect("/perfil", {
            headers: {
                "Set-Cookie": await authCookie.serialize({
                    token: data.token,
                    user: data.user,
                }),
            },
        })
    } catch (error) {
        return json({
            errors: { form: "Error de conexión. Intenta de nuevo más tarde." },
        })
    }
}

export default function Login() {
    const actionData = useActionData()
    const navigation = useNavigation()
    const isSubmitting = navigation.state === "submitting"

    const [passwordVisible, setPasswordVisible] = useState(false)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-teal-700">Iniciar sesión</h2>
                        <p className="text-slate-500 mt-2">Bienvenido de nuevo</p>
                    </div>

                    <Form method="post" className="space-y-6">
                        {actionData?.errors?.form && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {actionData.errors.form}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                placeholder="tu@correo.com"
                            />
                            {actionData?.errors?.email && <p className="mt-1 text-sm text-red-600">{actionData.errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={passwordVisible ? "text" : "password"}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Tu contraseña"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                >
                                    {passwordVisible ? (
                                        <span className="text-sm">Ocultar</span>
                                    ) : (
                                        <span className="text-sm">Mostrar</span>
                                    )}
                                </button>
                            </div>
                            {actionData?.errors?.password && (
                                <p className="mt-1 text-sm text-red-600">{actionData.errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                                    Recordarme
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="/recuperar-password" className="text-teal-600 hover:text-teal-700 font-medium">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:outline-none disabled:opacity-70"
                            >
                                {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                            </button>
                        </div>

                        <div className="text-center text-sm text-slate-500 mt-4">
                            ¿No tienes una cuenta?{" "}
                            <a href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                                Regístrate
                            </a>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}

