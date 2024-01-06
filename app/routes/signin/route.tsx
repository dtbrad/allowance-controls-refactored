import {
    json,
    redirect,
    type ActionFunctionArgs,
    type MetaFunction
} from "@remix-run/node";
import {Form, useActionData, useFetcher} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useRef, useState} from "react";
import {validationError} from "remix-validated-form";
import {z} from "zod";
import {Role} from "~/db/dbTypes";
import getUser from "~/db/getUser";
import SubmitButton from "~/formComponents/MySubmitButton";
import TextInputGroup from "~/formComponents/MyTextInput";
import authCookie from "~/helpers-server/authCookie.server";
import hashPassword from "~/helpers-server/hashPassword.server";
import styles from "./route.module.css";

export const meta: MetaFunction = () => {
    return [
        {title: "Family Allowance Sign In"},
        {name: "description", content: "Family Allowance Sign In Page"}
    ];
};

const schema = z.object({
    id: z.string().min(1, {message: "First name is required"}),
    password: z.string().min(1, {message: "Password is required"})
});

const validator = withZod(schema);

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const result = await validator.validate(formData);

    if (result.error) {
        return validationError(result.error);
    }

    const {id, password} = result.data;

    const userFromDb = await getUser(id);

    if (!userFromDb) {
        return json({
            error: "Server Error: Invalid Credentials",
            status: 401
        });
    }

    if (hashPassword(password) !== userFromDb.passwordDigest) {
        return json({
            error: "Server Error: Invalid Credentials",
            status: 401
        });
    }

    const route = Role.STANDARD === userFromDb.role ? "/summary" : "/users";

    return redirect(route, {
        headers: {
            "Set-Cookie": await authCookie.serialize(userFromDb.id)
        }
    });
}

function ErrorMessage({message}: {message?: string}) {
    const content = message;

    return <div className={styles.errorMessage}>{content}</div>;
}

export default function SigninForm() {
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

    const actionDataObject = actionData as any;

    const {idError, passwordError} = Object.fromEntries(
        ["id", "password"].map(function (field) {
            return [
                field + "Error",
                (attemptedSubmit && clientValidationErrors?.[field]) ||
                    fetcher?.data?.fieldErrors?.[field]
            ];
        })
    );

    const invalidCredentialsError =
        fetcher?.data?.error || actionDataObject?.error;

    const degradedServerValidationError =
        actionDataObject?.fieldErrors &&
        "Server Validation: Looks like you missed some form fields.";

    return (
        <div className={styles.signinPage}>
            <ErrorMessage
                message={
                    invalidCredentialsError || degradedServerValidationError
                }
            />
            <Form
                className={styles.signinCard}
                ref={formRef}
                onSubmit={handleSubmit}
                method="post"
                noValidate
            >
                <h1 className={styles.signInTitle}>Sign In</h1>
                <TextInputGroup
                    name="id"
                    label="name"
                    error={idError}
                    onChange={validateForm}
                />
                <TextInputGroup
                    name="password"
                    label="password"
                    type="password"
                    error={passwordError}
                    onChange={validateForm}
                />
                <SubmitButton
                    className={styles.signInButton}
                    loading={fetcher.state !== "idle"}
                    loadingMessage="Signing In..."
                    message="Sign In"
                />
            </Form>
        </div>
    );
}
