import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {z} from "zod";
import {zfd} from "zod-form-data";
import createTransaction from "~/db/createTransaction";
import {Role} from "~/db/dbTypes";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";

export const addTransactionSchema = z.object({
    description: z.string().min(1, {message: "Required!"}),
    amount: z.coerce
        .number()
        .multipleOf(0.01, {message: "Not a valid $ amount!"})
        .positive("Required!")
        .or(z.coerce.number().negative("Required!"))
});

const addTransactionServerSchema = zfd.formData(addTransactionSchema);

export async function action({request, params}: ActionFunctionArgs) {
    const userId = params.userId!;
    const user = await getUserFromCookie(request);
    const {role} = user;

    if (role !== Role.ADMIN) {
        throw new Response("Not allowed", {status: 401});
    }

    const {amount, description} = addTransactionServerSchema.parse(
        await request.formData()
    );

    await createTransaction(userId, amount, description);

    return redirect(`/users/${userId}`);
}
