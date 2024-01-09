import {
    json,
    redirect,
    type ActionFunctionArgs,
    type MetaFunction
} from "@remix-run/node";
import {
    FetcherWithComponents,
    Form,
    useActionData,
    useFetcher
} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {RefObject, useEffect, useRef, useState} from "react";
import {FieldErrors} from "remix-validated-form";
import {z} from "zod";
import {Role} from "~/db/dbTypes";
import getUser from "~/db/getUser";
import SubmitButton from "~/formControls/SubmitButton";
import TextInputGroup from "~/formControls/TextInputGroup";
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
    id: z.string().min(1, {message: "Name is required"}),
    password: z.string().min(1, {message: "Password is required"})
});

const validator = withZod(schema);

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.formData();
    const result = await validator.validate(formData);

    if (result.error) {
        return json({result, status: 400});
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

function useFormManager(
    fetcher: FetcherWithComponents<any>,
    actionData: any,
    formRef: RefObject<HTMLFormElement>
) {
    const isLoading = fetcher.state !== "idle";
    const serverError = fetcher?.data?.error; // requires js be enabled
    const htmlServerError = actionData?.error; // requires js be disabled

    async function validate() {
        const formData = new FormData(formRef.current!);
        const validationResults = await validator.validate(formData);

        setValidationErrors(validationResults.error?.fieldErrors);
    }

    return {
        isLoading,
        serverError: serverError || htmlServerError
    };
}

export default function SigninForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    // TODO: implement proper type narrowing to handle actionData union type when using `<typeof action>` instead of `<any>`
    // Union type arises from action returning both validation errors and invalid credentials error
    // Note this will become an issue when introducing error handling in the other forms
    const fetcher = useFetcher<any>();
    const actionData = useActionData<any>();
    const {isLoading, serverError} = useFormManager(fetcher, actionData);

    useEffect(function () {
        idRef.current!.focus();
    }, []);

    return (
        <div className={styles.signinPage}>
            <div className={styles.errorMessage}>{serverError}</div>
            <fetcher.Form
                className={styles.signinCard}
                ref={formRef}
                // onSubmit={handleSubmit}
                method="post"
                noValidate
            >
                <h1 className={styles.signInTitle}>Sign In</h1>
                <TextInputGroup
                    name="id"
                    label="name"
                    // error={idError}
                    // onChange={validateForm}
                    ref={idRef}
                    defaultValue={actionData?.result?.submittedData?.id}
                />
                <TextInputGroup
                    name="password"
                    label="password"
                    type="password"
                    // error={passwordError}
                    // onChange={validateForm}
                    defaultValue={actionData?.result?.submittedData?.password}
                />
                <SubmitButton
                    className={styles.signInButton}
                    loading={isLoading}
                    loadingMessage="Signing In..."
                    message="Sign In"
                />
            </fetcher.Form>
        </div>
    );
}
