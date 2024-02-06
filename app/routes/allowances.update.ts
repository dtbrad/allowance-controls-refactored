import {ActionFunctionArgs, LoaderFunctionArgs} from "@remix-run/node";
import createTransaction from "~/db/createTransaction";
import getUserSummaries from "~/db/getUserSummaries";

export async function action({request}: ActionFunctionArgs) {
    if (
        request.headers.get("authorization") !==
        `Bearer ${process.env.CRON_SECRET}`
    ) {
        return {message: "did not work", status: 401};
    }

    const users = await getUserSummaries();

    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        weekday: "long" as const // This option will return the day of the week
    });

    const today = formatter.format(now).toUpperCase();

    const usersToUpdate = users.filter((user) => user.allowanceDay === today);

    try {
        await Promise.all(
            usersToUpdate.map(function (user) {
                createTransaction(
                    user.id,
                    user.allowanceAmount / 100, // createTransaction multiplies by 100
                    "Weekly  Allowance"
                );
            })
        );

        return {
            json: {
                message: "success",
                updatedUsers: usersToUpdate
            }
        };
    } catch (error) {
        return {json: {message: "error"}, status: 500};
    }
}
