import {Link, useFetcher} from "@remix-run/react";
import {FormEvent, useState} from "react";
import styles from "./UserListItem.module.css";

export default function UserListItem({userId}: {userId: string}) {
    const fetcher = useFetcher();
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        if (!showConfirmDelete) {
            event.preventDefault(); // onl
            setShowConfirmDelete(true);
        }
    }

    const buttonActionTitle = showConfirmDelete ? "confirm delete" : "(x)";

    return (
        <div className={styles.userListItem}>
            <Link to={`/users/${userId}`}>{userId}</Link>
            <fetcher.Form method="post" onSubmit={handleSubmit}>
                <input name="userIdForDeletion" type="hidden" value={userId} />
                <button type="submit" className={styles.deleteUser}>
                    {fetcher.state !== "idle"
                        ? "deleting..."
                        : buttonActionTitle}
                </button>
                {showConfirmDelete && fetcher.state === "idle" && (
                    <button
                        className={styles.deleteUser}
                        onClick={() => setShowConfirmDelete(false)}
                    >
                        cancel
                    </button>
                )}
            </fetcher.Form>
        </div>
    );
}
