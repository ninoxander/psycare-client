import { json, redirect } from "@remix-run/node"
import { useLoaderData, Form } from "@remix-run/react"
import { createCookie } from "@remix-run/node"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

    if (!cookie || !cookie.user) {
        return redirect("/login")
    }

    return json({ user: cookie.user })
}

export async function action({ request }) {
    const formData = await request.formData()
    const intent = formData.get("intent")

    if (intent === "logout") {
        return redirect("/login", {
            headers: {
                "Set-Cookie": await authCookie.serialize(
                    {},
                    {
                        expires: new Date(0),
                    },
                ),
            },
        })
    }

    return null
}

export default function Perfil() {
    const { user } = useLoaderData()

    const formatDate = (dateString) => {
        if (!dateString) return "No disponible"
        try {
            return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: es })
        } catch (e) {
            return "Fecha inválida"
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-teal-700">Mi Perfil</h1>
                            <div className="flex space-x-3">
                                <Form method="post">
                                    <input type="hidden" name="intent" value="logout" />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:outline-none text-sm font-medium"
                                    >
                                        Cerrar sesión
                                    </button>
                                </Form>
                                <a
                                    href="/profile/edit"
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:outline-none text-sm font-medium inline-flex items-center"
                                >
                                    Editar perfil
                                </a>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-xl text-white">
                                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                                {user.pronouns && <p className="text-teal-100 text-sm">{user.pronouns}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Correo electrónico</h3>
                                    <p className="text-slate-800 font-medium">{user.email}</p>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="text-sm font-medium text-slate-500 mb-1">Miembro desde</h3>
                                    <p className="text-slate-800 font-medium">{formatDate(user.created_at)}</p>
                                </div>
                            </div>

                            {user.bio && (
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="text-sm font-medium text-slate-500 mb-2">Biografía</h3>
                                    <p className="text-slate-700 leading-relaxed">{user.bio}</p>
                                </div>
                            )}

                            <div className="border-t border-slate-200 pt-6">
                                <h3 className="text-lg font-medium text-slate-700 mb-4">Información adicional</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-500">ID de usuario</h4>
                                        <p className="text-slate-700">{user.user_id}</p>
                                    </div>

                                    {user.updated_at && (
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-500">Última actualización</h4>
                                            <p className="text-slate-700">{formatDate(user.updated_at)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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

