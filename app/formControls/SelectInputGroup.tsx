import styles from "./SelectInputGroup.module.css";

export interface SelectProps {
    options: {name: string; value: any}[];
    name: string;
    label: string;
    error?: string;
    className?: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    defaultValue?: string;
}

export default function SelectInputGroup({
    options,
    name,
    label,
    error,
    onChange,
    className,
    defaultValue
}: SelectProps) {
    const inputClassName = `${styles.inputField} ${
        !!error && styles.inputFieldError
    }`;
    return (
        <div className={className}>
            <div>
                <label htmlFor={name} className={styles.label}>
                    <div className={styles.inputLabel}>{label}</div>
                    {!!error && (
                        <div className={styles.inputErrorText}>{error}</div>
                    )}
                </label>
            </div>
            <select
                className={inputClassName}
                required
                defaultValue={defaultValue || ""}
                name={name}
                onChange={onChange}
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
