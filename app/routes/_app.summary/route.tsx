import {LoaderFunctionArgs, MetaFunction} from "@remix-run/node";
import {useLoaderData, useSearchParams} from "@remix-run/react";
import getTransactions from "~/db/getTransactions";
import getUserBalance from "~/db/getUserBalance";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";
import formatCurrency from "~/helpers/formatCurrency";
import Pagination from "~/sharedComponents/Pagination";
import TransactionsTable from "~/sharedComponents/TransactionsTable";
import styles from "./route.module.css";

export async function loader({request}: LoaderFunctionArgs) {
    const {id} = await getUserFromCookie(request);
    const pageString = new URL(request.url).searchParams.get("page");
    const pageNumber = pageString ? parseInt(pageString) : 1;

    const {transactions, totalPages} = await getTransactions(id, pageNumber);
    const balance = await getUserBalance(id);

    return {transactions, balance, totalPages};
}

export const meta: MetaFunction = () => {
    return [
        {title: "Family Allowance - Users"},
        {name: "description", content: "Family Allowance Summary Page"}
    ];
};

export default function Summary() {
    const data = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const currentPageString = searchParams.get("page");
    const currentPage = currentPageString ? parseInt(currentPageString) : 1;

    if (!data) {
        return null;
    }
    const {transactions, balance, totalPages} = data;

    return (
        <div className={styles.summary}>
            <div className={styles.header}>
                <p>Balance: {formatCurrency(balance)}</p>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
            <TransactionsTable transactions={transactions} />
        </div>
    );
}
