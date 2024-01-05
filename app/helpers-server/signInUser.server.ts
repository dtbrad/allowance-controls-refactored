import {Role} from "~/db/dbTypes";
import {json, redirect} from "@remix-run/node";
import hashPassword from "~/helpers-server/hashPassword.server";
import getUser from "~/db/getUser";
import authCookie from "./authCookie.server";

export default async function signInUser(signInName: string, password: string) {
    const userFromDb = await getUser(signInName);

    if (!userFromDb) {
        return json({error: "Server Error: Invalid Credentials", status: 401});
    }

    if (hashPassword(password) !== userFromDb.passwordDigest) {
        return json({error: "Server Error: Invalid Credentials", status: 401});
    }

    const route = Role.STANDARD === userFromDb.role ? "/summary" : "/users";

    return redirect(route, {
        headers: {
            "Set-Cookie": await authCookie.serialize(userFromDb.id)
        }
    });
}
