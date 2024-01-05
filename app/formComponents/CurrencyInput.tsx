import {useField} from "remix-validated-form";
import styles from "./CurrencyInput.module.css";

type CurrencyInputProps = {
    name: string;
    label: string;
    showError: boolean;
    className?: string;
};

export default function CurrencyInput({
    name,
    label,
    showError,
    className
}: CurrencyInputProps) {
    const {error, getInputProps} = useField(name);
    const hasDisplayedError = error && showError;

    const inputClassName = `${styles.inputField} ${
        hasDisplayedError && styles.inputFieldError
    }`;

    return (
        <div className={className}>
            <label htmlFor={name} className={styles.label}>
                <div className={styles.inputLabel}>{label}</div>
                {hasDisplayedError && (
                    <div className={styles.inputErrorText}>{error}</div>
                )}
            </label>
            <div className={styles.currencyWrap}>
                <span className={styles.currencyCode}>$</span>
                <input
                    autoComplete="off"
                    required
                    className={inputClassName}
                    {...getInputProps({id: name, type: "number", step: 0.01})}
                />
            </div>
        </div>
    );
}
