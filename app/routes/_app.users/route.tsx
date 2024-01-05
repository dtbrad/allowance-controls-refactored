import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {Role} from "~/db/dbTypes";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";

export async function loader({request}: LoaderFunctionArgs) {
    const {role} = await getUserFromCookie(request);
    if (role !== Role.ADMIN) {
        throw redirect("/summary");
    }

    return null;
}

export default function Users() {
    return <h1>Users List</h1>;
}
