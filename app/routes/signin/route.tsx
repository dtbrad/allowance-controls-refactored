import {
    json,
    redirect,
    type ActionFunctionArgs,
    type MetaFunction
} from "@remix-run/node";
import {useActionData, useFetcher} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useEffect, useRef} from "react";
import {z} from "zod";
import {Role} from "~/db/dbTypes";
import getUser from "~/db/getUser";
import SubmitButton from "~/formControls/SubmitButton";
import TextInputGroup from "~/formControls/TextInputGroup";
import authCookie from "~/helpers-server/authCookie.server";
import hashPassword from "~/helpers-server/hashPassword.server";
import useFormManager from "~/helpers/useFormManager";
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

export default function SigninAltForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    // TODO: implement proper type narrowing to handle actionData union type when using `<typeof action>` instead of `<any>`
    // Union type arises from action returning both validation errors and invalid credentials error
    // Note this will become an issue when introducing error handling in the other forms
    const fetcher = useFetcher<any>();
    const actionData = useActionData<any>();
    const {
        isLoading,
        serverError,
        validationErrors,
        htmlServerFormValues,
        performClientSideFormValidation,
        submitIfValid
    } = useFormManager(fetcher, actionData, formRef, validator);

    useEffect(function () {
        idRef.current!.focus();
    }, []);

    return (
        <div className={styles.signinPage}>
            <div className={styles.errorMessage}>{serverError}</div>
            <fetcher.Form
                className={styles.signinCard}
                ref={formRef}
                onSubmit={submitIfValid}
                method="post"
                noValidate
            >
                <h1 className={styles.signInTitle}>Sign In</h1>
                <TextInputGroup
                    name="id"
                    label="name"
                    error={validationErrors?.id}
                    onChange={performClientSideFormValidation}
                    ref={idRef}
                    defaultValue={htmlServerFormValues?.id}
                />
                <TextInputGroup
                    name="password"
                    label="password"
                    type="password"
                    error={validationErrors?.password}
                    onChange={performClientSideFormValidation}
                    defaultValue={htmlServerFormValues?.password}
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
