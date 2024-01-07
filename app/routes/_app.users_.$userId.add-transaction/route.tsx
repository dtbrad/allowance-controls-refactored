import {ActionFunctionArgs, redirect} from "@remix-run/node";
import {Form, Link, useFetcher, useParams} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useEffect, useRef, useState} from "react";
import {validationError} from "remix-validated-form";
import {z} from "zod";
import createTransaction from "~/db/createTransaction";
import {Role} from "~/db/dbTypes";
import CurrencyInputGroup from "~/formControls/CurrencyInputGroup";
import SubmitButton from "~/formControls/SubmitButton";
import TextInputGroup from "~/formControls/TextInputGroup";
import getUserFromCookie from "~/helpers-server/getUserFromCookie.server";
import styles from "./route.module.css";

export const addTransactionSchema = z.object({
    description: z.string().min(1, {message: "Required!"}),
    amount: z.coerce
        .number()
        .multipleOf(0.01, {message: "Not a valid $ amount!"})
        .positive("Required!")
        .or(z.coerce.number().negative("Required!"))
});

const validator = withZod(addTransactionSchema);

export async function action({request, params}: ActionFunctionArgs) {
    const userId = params.userId!;
    const user = await getUserFromCookie(request);
    const {role} = user;

    if (role !== Role.ADMIN) {
        throw new Response("Not allowed", {status: 401});
    }

    const result = await validator.validate(await request.formData());

    if (result.error) {
        return validationError(result.error);
    }

    const {amount, description} = result.data;

    await createTransaction(userId, amount, description);

    return redirect(`/users/${userId}`);
}

export default function AddTransactionForm() {
    const {userId} = useParams();
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const fetcher = useFetcher<any>();
    const [clientValidationErrors, setClientValidationErrors] = useState<any>(
        {}
    );

    useEffect(function () {
        descriptionRef.current!.focus();
    }, []);

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

    const {amountError, descriptionError} = Object.fromEntries(
        ["amount", "description"].map((field) => [
            field + "Error",
            (attemptedSubmit && clientValidationErrors?.[field]) ||
                fetcher?.data?.fieldErrors?.[field]
        ])
    );

    return (
        <div className={styles.addTransactionContainer}>
            <div>
                <Link to={`/users/${userId}`}>Cancel Add Transaction</Link>
            </div>
            <Form
                className={styles.addTransactionForm}
                ref={formRef}
                onSubmit={handleSubmit}
                method="post"
                noValidate
            >
                <TextInputGroup
                    name="description"
                    label="Description"
                    error={descriptionError}
                    onChange={validateForm}
                    ref={descriptionRef}
                />
                <CurrencyInputGroup
                    name="amount"
                    label="Amount"
                    error={amountError}
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