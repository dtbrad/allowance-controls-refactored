import styles from "./CurrencyInputGroup.module.css";

type CurrencyInputProps = {
    name: string;
    label: string;
    error?: string;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    defaultValue?: string;
};

export default function CurrencyInputGroup({
    name,
    label,
    error,
    className,
    onChange,
    defaultValue
}: CurrencyInputProps) {
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
            <div className={styles.currencyWrap}>
                <span className={styles.currencyCode}>$</span>
                <input
                    autoComplete="off"
                    required
                    className={inputClassName}
                    onChange={onChange}
                    name={name}
                    type="number"
                    step="0.01"
                    defaultValue={defaultValue}
                />
            </div>
        </div>
    );
}
