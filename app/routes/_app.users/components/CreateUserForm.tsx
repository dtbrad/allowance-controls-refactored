import {useFetcher} from "@remix-run/react";
import {withZod} from "@remix-validated-form/with-zod";
import {useEffect, useRef, useState} from "react";
import {useHydrated} from "remix-utils/use-hydrated";
import {ValidatedForm, useIsSubmitting} from "remix-validated-form";
import {DayofWeek} from "~/db/dbTypes";
import {newUserSchema} from "~/routes/users.create";
import CurrencyInput from "~/formComponents/CurrencyInput";
import SelectDropdown from "~/formComponents/SelectDropdown";
import TextInput from "~/formComponents/TextInput";
import styles from "./CreateUserForm.module.css";
import SubmitButton from "~/formComponents/SubmitButton";

const validator = withZod(newUserSchema);

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
