import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    MetaFunction,
    redirect
} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {Role} from "~/db/dbTypes";
import deleteUser from "~/db/deleteUser";
import getUserSummaries from "~/db/getUserSummaries";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";
import UsersTable from "./components/UsersTable";

export const meta: MetaFunction = () => {
    return [
        {title: "Family Allowance - Users"},
        {name: "description", content: "Family Allowance Users Page"}
    ];
};

export async function loader({request}: LoaderFunctionArgs) {
    const {role} = await getUserFromCookie(request);
    if (role !== Role.ADMIN) {
        throw redirect("/summary");
    }

    return await getUserSummaries();
}

export async function action({request, params}: ActionFunctionArgs) {
    const user = await getUserFromCookie(request);
    const {role} = user;

    if (role !== Role.ADMIN) {
        throw new Response("Not allowed", {status: 401});
    }

    const formData = await request.formData();

    const {userIdForDeletion} = Object.fromEntries(formData);

    await deleteUser(String(userIdForDeletion));

    return {message: "deleted"};
}

export default function Users() {
    const data = useLoaderData<typeof loader>();

    return (
        <>
            <h1>Users</h1>
            <UsersTable users={data} />
        </>
    );
}
