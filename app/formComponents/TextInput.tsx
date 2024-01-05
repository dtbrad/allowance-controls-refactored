import {useField} from "remix-validated-form";
import styles from "./TextInput.module.css";

type TextInputProps = {
    name: string;
    label: string;
    showError: boolean;
    type?: "text" | "password" | "hidden";
    value?: string;
    className?: string;
};

export default function TextInput({
    name,
    label,
    showError,
    type = "text",
    value,
    className
}: TextInputProps) {
    const {error, getInputProps} = useField(name);
    const hasDisplayedError = error && showError;

    const inputClassName = `${styles.inputField} ${
        hasDisplayedError && styles.inputFieldError
    }`;

    if (type === "hidden") {
        return <input {...getInputProps<any>({id: name, type, value})} />;
    }

    return (
        <div className={className}>
            <div>
                <label htmlFor={name} className={styles.label}>
                    <div className={styles.inputLabel}>{label}</div>
                    {hasDisplayedError && (
                        <div className={styles.inputErrorText}>{error}</div>
                    )}
                </label>
            </div>
            <input
                autoComplete="off"
                required
                className={inputClassName}
                {...getInputProps({id: name, type})}
            />
        </div>
    );
}
