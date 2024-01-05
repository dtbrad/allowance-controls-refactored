import {Link, useNavigation} from "@remix-run/react";
import styles from "./Pagination.module.css";

export default function Pagination({
    currentPage,
    totalPages
}: {
    currentPage: number;
    totalPages: number;
}) {
    const {location} = useNavigation();
    const isBusy = location?.state?.pageNavigation;

    return (
        <div className={styles.pagination}>
            {isBusy ? (
                <>
                    <span className={styles.loadingMessage}>Loading... </span>
                    <span className={styles.loadingSpinner} />
                </>
            ) : (
                <>
                    {currentPage > 1 && (
                        <Link
                            state={{pageNavigation: true}}
                            className={styles.paginationArrow}
                            to={`?page=${currentPage - 1}`}
                        >
                            &laquo;
                        </Link>
                    )}
                    <div className={styles.currentPage}>
                        {`page ${currentPage} of ${totalPages}`}
                    </div>
                    {totalPages > currentPage && (
                        <Link
                            state={{pageNavigation: true}}
                            className={styles.paginationArrow}
                            to={`?page=${currentPage + 1}`}
                        >
                            &raquo;
                        </Link>
                    )}
                </>
            )}
        </div>
    );
}
