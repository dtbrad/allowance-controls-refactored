import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {Form, Link, useActionData, useFetcher} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useRef, useState} from "react";
import {validationError} from "remix-validated-form";
import {z} from "zod";
import createUser from "~/db/createUser";
import {DayofWeek, Role} from "~/db/dbTypes";
import CurrencyInputGroup from "~/formComponents/MyCurrencyInput";
import SelectInputGroup from "~/formComponents/MySelectDropdown";
import SubmitButton from "~/formComponents/MySubmitButton";
import TextInputGroup from "~/formComponents/MyTextInput";
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

export async function action({request}: ActionFunctionArgs) {
    const user = await getUserFromCookie(request);
    const {role} = user;

    if (role !== Role.ADMIN) {
        throw new Response("Not allowed", {status: 401});
    }

    const result = await validator.validate(await request.formData());

    if (result.error) {
        return validationError(result.error);
    }

    const {id, password, amount, dayPreference} = result.data;

    await createUser({id, password, amount, dayPreference});

    return redirect("/users");
}

export default function CreateUserForm() {
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const actionData = useActionData<typeof action>();
    const fetcher = useFetcher<any>();
    const [clientValidationErrors, setClientValidationErrors] = useState<any>(
        {}
    );

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setAttemptedSubmit(true);

        const formData = new FormData(event.currentTarget);
        const validationResults = await validator.validate(formData);

        if (validationResults.error) {
            return setClientValidationErrors(
                validationResults.error.fieldErrors
            );
        }

        fetcher.submit(formData, {method: "post"});
    }

    async function validateForm() {
        const formData = new FormData(formRef.current!);
        const validationResults = await validator.validate(formData);

        setClientValidationErrors(validationResults?.error?.fieldErrors);
    }

    const {idError, passwordError, amountError, dayPreferenceError} =
        Object.fromEntries(
            ["id", "password", "amount", "dayPreference"].map((field) => [
                field + "Error",
                (attemptedSubmit && clientValidationErrors?.[field]) ||
                    fetcher?.data?.fieldErrors?.[field] ||
                    actionData?.fieldErrors[field]
            ])
        );

    return (
        <div className={styles.createUserContainer}>
            <div>
                <Link to="/users">Close New User Form</Link>
            </div>
            <h2 className={styles.createUserTitle}>Create a User</h2>
            <Form
                className={styles.createUserForm}
                ref={formRef}
                onSubmit={handleSubmit}
                method="post"
                noValidate
            >
                <TextInputGroup
                    name="id"
                    label="name"
                    error={idError}
                    onChange={validateForm}
                />
                <TextInputGroup
                    name="password"
                    type="password"
                    label="password"
                    error={passwordError}
                    onChange={validateForm}
                />
                <CurrencyInputGroup
                    name="amount"
                    label="amount"
                    error={amountError}
                    onChange={validateForm}
                />
                <SelectInputGroup
                    name="dayPreference"
                    label="Day Preference"
                    error={dayPreferenceError}
                    options={Object.keys(DayofWeek).map((day) => ({
                        name: day,
                        value: day
                    }))}
                    onChange={validateForm}
                />
                <SubmitButton
                    className={styles.submitButton}
                    loading={fetcher.state !== "idle"}
                    loadingMessage="Saving..."
                    message="Save"
                />
            </Form>
        </div>
    );
}
