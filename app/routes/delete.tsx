import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { createCookie } from "@remix-run/node"

const authCookie = createCookie("auth", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
})

export async function action({ request }: ActionFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie")
    const cookie = await authCookie.parse(cookieHeader)

    if (!cookie || !cookie.token) {
        return redirect("/login")
    }

    const formData = await request.formData()
    const intent = formData.get("intent")

    if (intent === "delete-account") {
        try {
            const response = await fetch("http://localhost:3000/users", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${cookie.token}`,
                },
            })

            if (!response.ok) {
                return redirect("/account/error?message=No se pudo eliminar la cuenta")
            }
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
        } catch (error) {
            return redirect("/account/error?message=Error de conexión")
        }
    }

    return redirect("/perfil")
}
export default function DeleteAccount() {
    return null
}

