export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-primary-700 to-primary-600 border border-transparent rounded-lg font-medium text-sm text-white tracking-wide hover:from-primary-800 hover:to-primary-700 focus:from-primary-800 focus:to-primary-700 active:from-primary-900 active:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all ease-in-out duration-200 ${
                    disabled && 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-md'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
