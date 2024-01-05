import {type ActionFunctionArgs, type MetaFunction} from "@remix-run/node";
import {useActionData} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useState} from "react";
import {useHydrated} from "remix-utils/use-hydrated";
import {ValidatedForm, useIsSubmitting} from "remix-validated-form";
import {z} from "zod";
import {zfd} from "zod-form-data";
import SubmitButton from "~/formComponents/SubmitButton";
import TextInput from "~/formComponents/TextInput";
import signInUser from "~/helpers-server/signInUser.server";
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

const signInSchema = zfd.formData(schema);

export async function action({request}: ActionFunctionArgs) {
    const {id, password} = signInSchema.parse(await request.formData());

    return await signInUser(id, password);
}

function ErrorMessage({message}: {message?: string}) {
    const isSubmitting = useIsSubmitting();
    const content = !isSubmitting && message;

    return <div className={styles.errorMessage}>{content}</div>;
}

export default function SigninForm() {
    const actionData = useActionData<typeof action>();
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const isHydrated = useHydrated();

    return (
        <div className={styles.signinPage}>
            <ValidatedForm
                validator={validator}
                method="post"
                autoComplete="off"
                noValidate={isHydrated}
            >
                <ErrorMessage message={actionData?.error} />
                <div className={styles.signinCard}>
                    <h1 className={styles.signInTitle}>Sign In</h1>
                    <TextInput
                        className={styles.signInControl}
                        showError={attemptedSubmit}
                        name="id"
                        label="Name"
                    />
                    <TextInput
                        className={styles.signInControl}
                        showError={attemptedSubmit}
                        name="password"
                        label="Password"
                        type="password"
                    />
                    <SubmitButton
                        onClick={() => setAttemptedSubmit(true)}
                        className={styles.signInButton}
                        loadingMessage="Signing In..."
                        message="Sign In"
                    />
                </div>
            </ValidatedForm>
        </div>
    );
}
