import {Outlet} from "@remix-run/react";

export default function Users() {
    return (
        <>
            <h1>Users List</h1>
            <Outlet />
        </>
    );
}
