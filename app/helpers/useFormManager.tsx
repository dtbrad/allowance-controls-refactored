import {FetcherWithComponents} from "@remix-run/react";
import {RefObject, useState} from "react";
import {Validator} from "remix-validated-form";

export default function useFormManager(
    fetcher: FetcherWithComponents<any>,
    actionData: any,
    formRef: RefObject<HTMLFormElement>,
    validator: Validator<any>
) {
    const [clientSideValidationErrors, setClientSideValidationErrors] =
        useState<any>();
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const isLoading =
        fetcher.state === "submitting" || fetcher.state === "loading";

    const serverError = fetcher?.data?.error; // requires js be enabled
    const htmlServerError = actionData?.error; // requires js be disabled

    const serverValidationErrors = fetcher?.data?.result?.error?.fieldErrors;
    const htmlServerValidationErrors = actionData?.result?.error?.fieldErrors;

    const validationErrors =
        (attemptedSubmit && clientSideValidationErrors) ||
        serverValidationErrors ||
        htmlServerValidationErrors;

    // to populate form after server validation when js is disabled
    const htmlServerFormValues = actionData?.result?.submittedData;

    async function performClientSideFormValidation() {
        const formData = new FormData(formRef.current!);
        const validationResults = await validator.validate(formData);
        setClientSideValidationErrors(validationResults.error?.fieldErrors);
    }

    async function submitIfValid(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setAttemptedSubmit(true);

        const formData = new FormData(formRef.current!);
        const validationResults = await validator.validate(formData);

        if (!validationResults.error) {
            return fetcher.submit(formData, {method: "post"});
        }

        setClientSideValidationErrors(validationResults.error?.fieldErrors);
    }

    return {
        isLoading,
        serverError: serverError || htmlServerError,
        validationErrors,
        htmlServerFormValues,
        performClientSideFormValidation,
        clientSideValidationErrors,
        submitIfValid
    };
}
