import {useFetcher, useParams} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useEffect, useRef, useState} from "react";
import {useHydrated} from "remix-utils/use-hydrated";
import {ValidatedForm, useIsSubmitting} from "remix-validated-form";
import CurrencyInput from "~/formComponents/CurrencyInput";
import TextInput from "~/formComponents/TextInput";
import {addTransactionSchema} from "../users.$userId.add-transaction";
import styles from "./AddTransactionForm.module.css";

const validator = withZod(addTransactionSchema);

function SubmitButton({onClick}: {onClick: () => void}) {
    const isSubmitting = useIsSubmitting();

    return (
        <button
            className={styles.submitButton}
            onClick={onClick}
            type="submit"
            disabled={isSubmitting}
        >
            {isSubmitting ? "Submitting..." : "Add Transaction"}
        </button>
    );
}

export default function AddTransactionForm() {
    const {userId} = useParams();
    const isHydrated = useHydrated();
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const fetcher = useFetcher();

    useEffect(
        function () {
            if (fetcher.state === "idle") {
                formRef.current?.reset();
            }
        },
        [fetcher.state]
    );

    return (
        <div className={styles.addTransactionContainer}>
            <ValidatedForm
                formRef={formRef}
                fetcher={fetcher}
                className={styles.addTransactionForm}
                validator={validator}
                method="post"
                action={`/users/${userId}/add-transaction`}
                autoComplete="off"
                noValidate={isHydrated}
            >
                <TextInput
                    name="description"
                    label="Description"
                    showError={attemptedSubmit}
                />
                <CurrencyInput
                    showError={attemptedSubmit}
                    name="amount"
                    label="Transaction Amount"
                />
                <SubmitButton onClick={() => setAttemptedSubmit(true)} />
            </ValidatedForm>
        </div>
    );
}
