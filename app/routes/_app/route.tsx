import {type LoaderFunctionArgs} from "@remix-run/node";
import {
    ClientLoaderFunctionArgs,
    Outlet,
    useLoaderData
} from "@remix-run/react";
import styles from "./route.module.css";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";
import {Role} from "~/db/dbTypes";

export async function loader({request}: LoaderFunctionArgs) {
    return await getUserFromCookie(request);
}

let cache: any;

export async function clientLoader({serverLoader}: ClientLoaderFunctionArgs) {
    if (cache) {
        return cache;
    }

    let loaderData = await serverLoader();

    cache = loaderData;

    return loaderData;
}

clientLoader.hydrate = true;

export default function AppLayout() {
    const {id, role} = useLoaderData<typeof loader>();

    return (
        <>
            <nav className={styles.navigation}>
                <h1 className={styles.title}>
                    {role === Role.ADMIN
                        ? "Allowance Admin Controls"
                        : "Savings Summary"}
                </h1>
                <form
                    method="post"
                    action="/signout"
                    className={styles.userSection}
                >
                    <p className={styles.loggedInUser}>Signed in as: {id}</p>
                    <button className={styles.signOutButton}>Sign Out</button>
                </form>
            </nav>
            <div className={styles.body}>
                <Outlet />
            </div>
        </>
    );
}
