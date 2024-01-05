import {Transaction} from "~/db/dbTypes";
import formatCurrency from "~/helpers/formatCurrency";
import formatDateString from "~/helpers/formatDateString";
import styles from "./TransactionsTable.module.css";

export interface TransactionsTableProps {
    transactions: Transaction[];
}

export default function UserSummaryTable({
    transactions
}: TransactionsTableProps) {
    return (
        <table className={styles.usersTable}>
            <thead>
                <tr className={styles.usersTableHeader}>
                    <th className={styles.usersTableCell}>Date</th>
                    <th className={styles.usersTableCell}>Amount</th>
                    <th className={styles.usersTableCell}>Description</th>
                </tr>
            </thead>
            <tbody className={styles.myRows}>
                {transactions.map(
                    ({transactionDate, amount, description}, index) => (
                        <tr key={transactionDate} className={styles.row}>
                            <td className={styles.usersTableCell}>
                                {formatDateString(transactionDate)}
                            </td>
                            <td className={styles.usersTableCell}>
                                {formatCurrency(amount)}
                            </td>
                            <td className={styles.usersTableCell}>
                                {description}
                            </td>
                        </tr>
                    )
                )}
            </tbody>
        </table>
    );
}
