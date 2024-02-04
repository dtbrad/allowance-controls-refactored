import {Link, useFetcher, useSearchParams} from "@remix-run/react";
import styles from "./UserListItem.module.css";

export default function UserListItem({userId}: {userId: string}) {
    const fetcher = useFetcher();
    const [searchParams] = useSearchParams();
    const confirmDeleteUser = searchParams.get("delete");

    return (
        <div className={styles.userListItem}>
            <Link to={`/users/${userId}`}>{userId}</Link>
            {confirmDeleteUser !== userId && (
                <Link to={`/users/?delete=${userId}`}>(x)</Link>
            )}
            {confirmDeleteUser === userId && (
                <>
                    {fetcher.state !== "idle" ? (
                        "deleting..."
                    ) : (
                        <fetcher.Form method="post">
                            <span>confirm delete {userId} </span>
                            <input
                                name="userIdForDeletion"
                                type="hidden"
                                value={userId}
                            />
                            <button type="submit" className={styles.deleteUser}>
                                yes
                            </button>
                        </fetcher.Form>
                    )}

                    {fetcher.state === "idle" && (
                        <Link className={styles.cancelDeleteUser} to="/users">
                            no
                        </Link>
                    )}
                </>
            )}
        </div>
    );
}
