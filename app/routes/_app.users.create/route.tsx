import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {Link, useFetcher} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useEffect, useRef, useState} from "react";
import {useHydrated} from "remix-utils/use-hydrated";
import {ValidatedForm} from "remix-validated-form";
import {z} from "zod";
import {zfd} from "zod-form-data";
import createUser from "~/db/createUser";
import {DayofWeek, Role} from "~/db/dbTypes";
import CurrencyInput from "~/formComponents/CurrencyInput";
import SelectDropdown from "~/formComponents/SelectDropdown";
import SubmitButton from "~/formComponents/SubmitButton";
import TextInput from "~/formComponents/TextInput";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";
import styles from "./route.module.css";

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

const validator = withZod(newUserSchema);
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

export default function CreateUserForm() {
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const isHydrated = useHydrated();
    const fetcher = useFetcher();
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(
        function () {
            if (fetcher.state === "idle") {
                formRef.current?.reset();
                setAttemptedSubmit(false);
            }
        },
        [fetcher.state]
    );

    return (
        <div className={styles.createUserContainer}>
            <div>
                <Link to="/users">Close New User Form</Link>
            </div>
            <h2 className={styles.createUserTitle}>Create a User</h2>
            <ValidatedForm
                formRef={formRef}
                fetcher={fetcher}
                validator={validator}
                method="post"
                action="/users/create"
                autoComplete="off"
                noValidate={isHydrated}
            >
                <div className={styles.createUserForm}>
                    <TextInput
                        showError={attemptedSubmit}
                        name="id"
                        label="Name"
                        className={styles.createUserInputField}
                    />
                    <TextInput
                        showError={attemptedSubmit}
                        name="password"
                        label="Password"
                        className={styles.createUserInputField}
                    />
                    <CurrencyInput
                        showError={attemptedSubmit}
                        name="amount"
                        label="Allowance Amount"
                        className={styles.createUserInputField}
                    />
                    <SelectDropdown
                        showError={attemptedSubmit}
                        name="dayPreference"
                        options={Object.keys(DayofWeek).map((day) => ({
                            name: day,
                            value: day
                        }))}
                        label="Allowance Day"
                        className={styles.createUserInputField}
                    />
                </div>
                <SubmitButton
                    onClick={() => setAttemptedSubmit(true)}
                    loadingMessage="Creating User..."
                    message="Create User"
                    className={styles.createUserButton}
                />
            </ValidatedForm>
        </div>
    );
}
