export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-accent-600 bg-accent-50 px-2 py-1 rounded-md animate-fadeIn transition-all duration-200 ' + className}
        >
            {message}
        </p>
    ) : null;
}
