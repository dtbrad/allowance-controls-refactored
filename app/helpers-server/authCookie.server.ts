import {createCookie} from "@remix-run/node";

const authCookie = createCookie("auth", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.COOKIE_SECRET!],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
});

export default authCookie;
