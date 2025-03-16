import { redirect } from "@remix-run/node";
import { createCookie } from "@remix-run/node"

export const authCookie = createCookie("auth", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
})
export const action = async () => {
    return redirect("/login", {
        headers: {
            "Set-Cookie": await authCookie.serialize("", {
                maxAge: 0, 
            }),
        },
    });
};

export default function Logout() {
    return null;
}