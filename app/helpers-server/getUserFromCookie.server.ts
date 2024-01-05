import {redirect} from "@remix-run/node";
import authCookie from "./authCookie.server";
import getUser from "~/db/getUser";

export default async function getUserFromCookie(request: Request) {
    let id = (await authCookie.parse(request.headers.get("Cookie"))) as string;

    if (!id) {
        throw redirect("/signin");
    }

    const userFromDb = await getUser(id);

    if (!userFromDb) {
        throw redirect("/signin");
    }

    const {passwordDigest, ...user} = userFromDb;

    return user;
}
