import {Outlet} from "@remix-run/react";

export default function App() {
    return (
        <>
            <h1>NavBar</h1>
            <Outlet />
        </>
    );
}
