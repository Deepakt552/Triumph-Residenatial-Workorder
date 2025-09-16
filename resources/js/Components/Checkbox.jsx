export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-primary-700 shadow-sm focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-1 transition-all duration-200 cursor-pointer hover:border-primary-400 ' +
                className
            }
        />
    );
}
