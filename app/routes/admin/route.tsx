import { json, redirect, MetaFunction } from "@remix-run/node";
import { useLoaderData, Form, useNavigate } from "@remix-run/react";
import { createMeta } from "~/utils/title";
import { authCookie } from "~/coookies/auth";
import React from "react";

export const meta: MetaFunction = () => {
    return createMeta("Mi perfil", "Página del perfil");
};

export async function loader({ request }) {
    const cookieHeader = request.headers.get("Cookie");
    const cookie = await authCookie.parse(cookieHeader);

    // Redirigir si no hay token
    if (!cookie || !cookie.token) {
        return redirect("/login");
    }

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${cookie.token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener datos del usuario");
        }

        const userData = await response.json();
        if(userData.role === "user") {
            return redirect("/perfil");
        }

        return json({ user: userData });
    } catch (error) {
        // Si hay un error, usar los datos de la cookie como respaldo
        if (cookie.user) {
            return json({
                user: cookie.user,
                error: "No se pudieron actualizar los datos del usuario. Mostrando datos almacenados.",
            });
        }
        return redirect("/login");
    }
}

export default function Admin() {
    const { user, error } = useLoaderData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4 sm:p-6 md:p-8">
            {/* Mostrar mensaje de error si existe */}
            {error && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <h1 className="text-black">Hello World</h1>
            <p>Rol: {user.role}</p>
        </div>
    );
}