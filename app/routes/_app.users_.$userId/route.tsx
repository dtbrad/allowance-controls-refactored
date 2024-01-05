import {LoaderFunctionArgs, redirect} from "@remix-run/node";
import {
    Link,
    useLoaderData,
    useLocation,
    useParams,
    useSearchParams
} from "@remix-run/react";
import {Role} from "~/db/dbTypes";
import getTransactions from "~/db/getTransactions";
import getUserBalance from "~/db/getUserBalance";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";
import formatCurrency from "~/helpers/formatCurrency";
import TransactionsTable from "~/sharedComponents/TransactionsTable";
import styles from "./route.module.css";

export async function loader({params, request}: LoaderFunctionArgs) {
    const {role} = await getUserFromCookie(request);

    if (role === Role.STANDARD) {
        return redirect("/summary");
    }

    const {userId} = params;

    if (!userId) {
        throw new Response("Not Found", {status: 404});
    }

    const pageString = new URL(request.url).searchParams.get("page");
    const pageNumber = pageString ? parseInt(pageString) : 1;

    const {transactions} = await getTransactions(userId);
    const balance = await getUserBalance(userId);

    return {transactions, balance};
}

export default function UserPage() {
    const data = useLoaderData<typeof loader>();
    const {userId} = useParams();
    const [searchParams] = useSearchParams();
    const currentPageString = searchParams.get("page");
    const currentPage = currentPageString ? parseInt(currentPageString) : 1;
    const location = useLocation();
    if (!data) {
        return null;
    }

    const {transactions, balance} = data;

    return (
        <div className={styles.summary}>
            <div className={styles.header}>
                <h2>
                    Balance for {userId}: {formatCurrency(balance)}
                </h2>
                <div className={styles.controls}>
                    <Link to={"/users"}>Back to Users</Link>
                </div>
            </div>
            <TransactionsTable transactions={transactions} />
        </div>
    );
}
