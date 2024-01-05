import {useParams} from "@remix-run/react";

export default function UserPage() {
    const params = useParams();
    return <h1>UserPage for {params.userId}</h1>;
}
