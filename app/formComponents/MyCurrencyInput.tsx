import styles from "./CurrencyInput.module.css";

type CurrencyInputProps = {
    name: string;
    label: string;
    error?: string;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CurrencyInput({
    name,
    label,
    error,
    className,
    onChange
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
                />
            </div>
        </div>
    );
}
