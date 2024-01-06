import styles from "./SubmitButton.module.css";

export interface ButtonProps {
    className?: string;
    message: string;
    loading: boolean;
    loadingMessage: string;
}

export default function MySubmitButton({
    className,
    loading,
    loadingMessage,
    message
}: ButtonProps) {
    const combinedClassNames = `${styles.button} ${className}`;

    return (
        <button className={combinedClassNames} type="submit" disabled={loading}>
            {loading ? loadingMessage : message}
        </button>
    );
}
