import styles from "./SelectDropdown.module.css";
import {useField} from "remix-validated-form";

export interface SelectProps {
    options: {name: string; value: any}[];
    name: string;
    label: string;
    showError: boolean;
    className?: string;
}

export default function SelectDropdown({
    options,
    name,
    label,
    showError,
    className
}: SelectProps) {
    const {error, getInputProps} = useField(name);
    const hasDisplayedError = error && showError;

    const inputClassName = `${styles.inputField} ${
        hasDisplayedError && styles.inputFieldError
    }`;
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
            <select
                className={inputClassName}
                required
                id="weekday-select"
                defaultValue=""
                {...getInputProps({id: name})}
            >
                <option className={styles.option} value="" disabled>
                    Please choose an option
                </option>
                {options.map(({name, value}) => (
                    <option key={value} className={styles.option} value={value}>
                        {name}
                    </option>
                ))}
            </select>
        </div>
    );
}
