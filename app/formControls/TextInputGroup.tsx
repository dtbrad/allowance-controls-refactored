import styles from "./TextInputGroup.module.css";
import {Ref, forwardRef} from "react";

type TextInputProps = {
    name: string;
    label: string;
    error?: string;
    type?: "text" | "password" | "hidden";
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function TextInputGroup(
    {name, label, error, type = "text", className, onChange}: TextInputProps,
    ref: Ref<HTMLInputElement>
) {
    const inputClassName = `${styles.inputField} ${
        !!error && styles.inputFieldError
    }`;

    return (
        <div className={className}>
            <label htmlFor={name} className={styles.label}>
                <div className={styles.inputLabel}>{label}</div>
                {!!error && (
                    <div className={styles.inputErrorText}>{error}</div>
                )}
            </label>

            <input
                ref={ref}
                autoComplete="off"
                required
                className={inputClassName}
                onChange={onChange}
                name={name}
                type={type}
            />
        </div>
    );
}

export default forwardRef(TextInputGroup);
