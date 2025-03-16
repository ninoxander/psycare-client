import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react"
import { createCookie } from "@remix-run/node"
import AccountSettings from "~/components/account-settings"

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
        return redirect("/login")
    }

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${cookie.token}`,
            },
        })

        if (!response.ok) {
            throw new Error("Error al obtener datos del usuario")
        }

        const userData = await response.json()
        return json({ user: userData, token: cookie.token })
    } catch (error) {
        // Si hay un error en la petición, intentamos usar los datos de la cookie como respaldo
        if (cookie.user) {
            return json({
                user: cookie.user,
                token: cookie.token,
                error: "No se pudieron actualizar los datos del usuario. Editando datos almacenados.",
            })
        }

        // Si no hay datos en la cookie, redirigimos al login
        return redirect("/login")
    }
}

export async function action({ request }) {
    const cookieHeader = request.headers.get("Cookie")
    const cookie = await authCookie.parse(cookieHeader)

    if (!cookie || !cookie.token) {
        return redirect("/login")
    }

    const formData = await request.formData()
    const name = formData.get("name")
    const email = formData.get("email")
    const bio = formData.get("bio")
    const pronouns = formData.get("pronouns")
    const age = formData.get("age") ? Number.parseInt(formData.get("age"), 10) : null

    const errors = {}

    if (!name) errors.name = "El nombre es requerido"
    if (!email) errors.email = "El correo electrónico es requerido"
    if (age !== null && (isNaN(age) || age < 0 || age > 120)) {
        errors.age = "La edad debe ser un número válido entre 0 y 120"
    }

    if (Object.keys(errors).length > 0) {
        return json({ errors })
    }

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cookie.token}`,
            },
            body: JSON.stringify({
                name,
                email,
                bio,
                pronouns,
                age,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            return json({
                errors: { form: errorData.message || "Error al actualizar el perfil" },
            })
        }

        const updatedUser = await response.json()

        // Actualizar la información del usuario en la cookie
        const updatedCookie = {
            ...cookie,
            user: updatedUser,
        }

        return redirect("/perfil", {
            headers: {
                "Set-Cookie": await authCookie.serialize(updatedCookie),
            },
        })
    } catch (error) {
        return json({
            errors: { form: "Error de conexión. Intenta de nuevo más tarde." },
        })
    }
}

export default function EditarPerfil() {
    const { user, token, error } = useLoaderData()
    const actionData = useActionData()
    const navigation = useNavigation()
    const isSubmitting = navigation.state === "submitting"

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                {error && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">{error}</div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-teal-700">Editar Perfil</h1>
                        </div>

                        <Form method="post" className="space-y-6">
                            {actionData?.errors?.form && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                    {actionData.errors.form}
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                    Nombre completo
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={user.name}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Tu nombre"
                                />
                                {actionData?.errors?.name && <p className="mt-1 text-sm text-red-600">{actionData.errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={user.email}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                    placeholder="tu@correo.com"
                                />
                                {actionData?.errors?.email && <p className="mt-1 text-sm text-red-600">{actionData.errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="pronouns" className="block text-sm font-medium text-slate-700 mb-1">
                                        Pronombres
                                    </label>
                                    <input
                                        id="pronouns"
                                        name="pronouns"
                                        type="text"
                                        defaultValue={user.pronouns || ""}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="ej. él/ella, elle"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">
                                        Edad
                                    </label>
                                    <input
                                        id="age"
                                        name="age"
                                        type="number"
                                        defaultValue={user.age || ""}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Tu edad"
                                        min="0"
                                        max="120"
                                    />
                                    {actionData?.errors?.age && <p className="mt-1 text-sm text-red-600">{actionData.errors.age}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                                    Biografía
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    defaultValue={user.bio || ""}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none"
                                    placeholder="Cuéntanos sobre ti..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <a
                                    href="/perfil"
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:outline-none text-sm font-medium"
                                >
                                    Cancelar
                                </a>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:outline-none text-sm font-medium"
                                >
                                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>

                {/* Componente de configuración de cuenta */}
                <AccountSettings token={token} userId={user.user_id} />

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

