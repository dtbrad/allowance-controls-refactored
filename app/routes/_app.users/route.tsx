import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    redirect
} from "@remix-run/node";
import {
    ClientLoaderFunctionArgs,
    Link,
    Outlet,
    useLoaderData,
    useLocation
} from "@remix-run/react";
import {Role} from "~/db/dbTypes";
import deleteUser from "~/db/deleteUser";
import getUserSummaries from "~/db/getUserSummaries";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";
import UsersTable from "./components/UsersTable";
import styles from "./route.module.css";

export const meta: MetaFunction = () => {
    return [
        {title: "Family Allowance - Users"},
        {name: "description", content: "Family Allowance Users Page"}
    ];
};

let cache: any;

export async function clientLoader({
    request,
    serverLoader
}: ClientLoaderFunctionArgs) {
    const revalidateUsers = new URL(request.url).searchParams.get(
        "revalidate-users"
    );

    if (revalidateUsers || !cache) {
        let loaderData = await serverLoader();

        cache = loaderData;

        return loaderData;
    }

    return cache;
}

clientLoader.hydrate = true;

export async function loader({request}: LoaderFunctionArgs) {
    const {role} = await getUserFromCookie(request);
    if (role !== Role.ADMIN) {
        throw redirect("/summary");
    }

    return await getUserSummaries();
}

export async function action({request}: ActionFunctionArgs) {
    const user = await getUserFromCookie(request);
    const {role} = user;

    if (role !== Role.ADMIN) {
        throw new Response("Not allowed", {status: 401});
    }

    const formData = await request.formData();

    const {userIdForDeletion} = Object.fromEntries(formData);

    await deleteUser(String(userIdForDeletion));

    return redirect("/users?revalidate-users=true");
}

export default function Users() {
    const location = useLocation();
    const data = useLoaderData<typeof loader>();

    return (
        <>
            <h1>Users</h1>
            <UsersTable users={data} />
            {!location.pathname.includes("create") && (
                <div className={styles.createUser}>
                    <Link to="/users/create">Open New User Form</Link>
                </div>
            )}
            <Outlet />
        </>
    );
}
