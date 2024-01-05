import {LoaderFunctionArgs} from "@remix-run/node";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";

export async function loader({request}: LoaderFunctionArgs) {
    const {id} = await getUserFromCookie(request);

    return null;
}

export default function Summary() {
    return <h1>Summary Page</h1>;
}
