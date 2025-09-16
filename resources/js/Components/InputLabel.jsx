export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-primary-800 mb-1 transition-colors duration-200 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
