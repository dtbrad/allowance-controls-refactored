import {redirect} from "@remix-run/node";
import authCookie from "~/helpers-server/authCookie.server";

export async function action() {
    return redirect("/signin", {
        headers: {
            "Set-Cookie": await authCookie.serialize("", {maxAge: 0})
        }
    });
}
