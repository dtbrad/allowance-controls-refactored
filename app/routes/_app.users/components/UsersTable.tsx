import formatCurrency from "~/helpers/formatCurrency";
import UserListItem from "./UserListItem";
import styles from "./UsersTable.module.css";

interface User {
    id: string;
    balance: number;
    allowanceAmount: number;
    allowanceDay: string;
}

export default function UsersTable({users}: {users: User[]}) {
    return (
        <div className={styles.userList}>
            <table className={styles.usersTable}>
                <thead>
                    <tr className={styles.usersTableHeader}>
                        <th className={styles.usersTableCell}>Name</th>
                        <th className={styles.usersTableCell}>Balance</th>
                        <th className={styles.usersTableCell}>Allowance</th>
                        <th className={styles.usersTableCell}>Day</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(
                        ({id, balance, allowanceAmount, allowanceDay}) => (
                            <tr key={id}>
                                <td
                                    className={`${styles.usersTableCell} ${styles.nameCell}`}
                                >
                                    <UserListItem userId={id} />
                                </td>
                                <td className={styles.usersTableCell}>
                                    {formatCurrency(balance)}
                                </td>
                                <td className={styles.usersTableCell}>
                                    {formatCurrency(allowanceAmount)}
                                </td>
                                <td className={styles.usersTableCell}>
                                    {allowanceDay.charAt(0).toUpperCase() +
                                        allowanceDay.slice(1).toLowerCase()}
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
}
