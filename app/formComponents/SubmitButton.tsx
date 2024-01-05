import styles from "./SubmitButton.module.css";
import {useIsSubmitting} from "remix-validated-form";

export interface ButtonProps {
    onClick?: () => void;
    className?: string;
    loadingMessage: string;
    message: string;
}

export default function SubmitButton({
    onClick,
    className,
    loadingMessage,
    message
}: ButtonProps) {
    const isSubmitting = useIsSubmitting();
    const combinedClassNames = `${styles.button} ${className}`;

    return (
        <button
            className={combinedClassNames}
            onClick={onClick}
            type="submit"
            disabled={isSubmitting}
        >
            {isSubmitting ? loadingMessage : message}
        </button>
    );
}
