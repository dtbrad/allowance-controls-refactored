import {LoaderFunctionArgs, MetaFunction, redirect} from "@remix-run/node";
import {
    ClientLoaderFunctionArgs,
    Link,
    Outlet,
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
import Pagination from "~/sharedComponents/Pagination";
import TransactionsTable from "~/sharedComponents/TransactionsTable";
import styles from "./route.module.css";

export const meta: MetaFunction = () => {
    return [
        {title: "Family Allowance User Summary"},
        {name: "description", content: "Family Allowance User Summary Page"}
    ];
};

export async function loader({params, request}: LoaderFunctionArgs) {
    const {role} = await getUserFromCookie(request);

    if (role === Role.STANDARD) {
        return redirect("/summary");
    }

    const {userId} = params;

    if (!userId) {
        throw new Response("Not Found", {status: 404});
    }

    const pageNumberString = new URL(request.url).searchParams.get("page");
    const pageNumber = pageNumberString ? parseInt(pageNumberString) : 1;

    const {transactions, totalPages} = await getTransactions(
        userId,
        pageNumber
    );
    const balance = await getUserBalance(userId);

    return {transactions, balance, totalPages};
}

// TODO: add typing for cache and loaderData
let cache: any;

export async function clientLoader({
    serverLoader,
    params,
    request
}: ClientLoaderFunctionArgs) {
    const pageNumberString =
        new URL(request.url).searchParams.get("page") || "1";
    const userFromParams = params.userId;
    const revalidateTransactions = new URL(request.url).searchParams.get(
        "revalidate-transactions"
    );

    if (!userFromParams) {
        throw new Response("Not Found", {status: 404});
    }

    // if there is no cache, then create one and return loaderData
    if (!cache) {
        const loaderData: any = await serverLoader();

        cache = {
            [userFromParams]: {
                user: userFromParams,
                balance: loaderData.balance,
                transactions: {[pageNumberString]: loaderData.transactions},
                totalPages: loaderData.totalPages
            }
        };

        return loaderData;
    }

    // if there is a cache but user has added a transaction, then reload user, add it cache and return loaderData
    // if there is a cache, but it doesn't contain the needed user, then add to cache and return loaderData
    if (revalidateTransactions || !cache[userFromParams]) {
        const loaderData: any = await serverLoader();

        cache[userFromParams] = {
            user: params.userId,
            balance: loaderData.balance,
            transactions: {[pageNumberString]: loaderData.transactions},
            totalPages: loaderData.totalPages
        };

        return loaderData;
    }

    // if cache contains userFromParams but not the needed page, then add to cache and return loaderData
    if (!cache[userFromParams].transactions[pageNumberString]) {
        const loaderData: any = await serverLoader();

        cache[userFromParams].transactions[pageNumberString] =
            loaderData.transactions;

        return loaderData;
    }

    // there is a cache for this user and it contains the needed page, so return all data from cache
    return {
        balance: cache[userFromParams].balance,
        transactions: cache[userFromParams].transactions[pageNumberString],
        totalPages: cache[userFromParams].totalPages
    };
}

clientLoader.hydrate = true;

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

    const {transactions, balance, totalPages} = data;

    return (
        <div className={styles.summary}>
            <div className={styles.header}>
                <h2>
                    Balance for {userId}: {formatCurrency(balance)}
                </h2>
                <div className={styles.controls}>
                    <Link to={"/users"}>Back to Users</Link>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
            </div>
            <TransactionsTable transactions={transactions} />
            {!location.pathname.includes("add-transaction") && (
                <div className={styles.addTransactionLink}>
                    <Link to={`/users/${userId}/add-transaction`}>
                        Open Add Transaction Form
                    </Link>
                </div>
            )}
            <Outlet />
        </div>
    );
}
