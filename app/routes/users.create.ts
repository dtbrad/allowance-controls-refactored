import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {z} from "zod";
import {zfd} from "zod-form-data";
import createUser from "~/db/createUser";
import {DayofWeek, Role} from "~/db/dbTypes";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";

export const newUserSchema = z.object({
    id: z.string().min(1, {message: "Required!"}),
    password: z.string().min(1, {message: "Required!"}),
    amount: z.coerce
        .number()
        .multipleOf(0.01, {message: "Not a valid $ amount!"})
        .positive("Required!")
        .or(z.number().negative("Required!")),
    dayPreference: z.nativeEnum(DayofWeek, {
        errorMap: (issue, ctx) => ({message: "Required!"})
    })
});

const newUserServerSchema = zfd.formData(newUserSchema);

export async function action({request}: ActionFunctionArgs) {
    const user = await getUserFromCookie(request);
    const {role} = user;

    if (role !== Role.ADMIN) {
        throw new Response("Not allowed", {status: 401});
    }

    const {id, dayPreference, amount, password} = newUserServerSchema.parse(
        await request.formData()
    );

    await createUser({id, password, amount, dayPreference});

    return redirect("/users");
}
