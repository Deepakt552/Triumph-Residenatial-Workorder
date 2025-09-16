import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    // If there's only one page, don't show pagination
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                {/* Previous page link (mobile) */}
                {links[0].url ? (
                    <Link
                        href={links[0].url}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="relative inline-flex cursor-default items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500">
                        Previous
                    </span>
                )}

                {/* Next page link (mobile) */}
                {links[links.length - 1].url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex cursor-default items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500">
                        Next
                    </span>
                )}
            </div>
            
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{links[1].label}</span> to{' '}
                        <span className="font-medium">{links[links.length - 2].label}</span> of{' '}
                        <span className="font-medium">{links[links.length - 1].meta?.total || 'many'}</span> results
                    </p>
                </div>
                
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* Desktop pagination links */}
                        {links.map((link, key) => {
                            // Don't render the "Next" and "Previous" links as they're handled separately
                            if (key === 0 || key === links.length - 1) {
                                return null;
                            }
                            
                            // Current page
                            if (link.active) {
                                return (
                                    <span
                                        key={key}
                                        aria-current="page"
                                        className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        {link.label}
                                    </span>
                                );
                            }
                            
                            // Ellipsis
                            if (link.label.includes('...')) {
                                return (
                                    <span
                                        key={key}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                                    >
                                        ...
                                    </span>
                                );
                            }
                            
                            // Regular page link
                            return (
                                <Link
                                    key={key}
                                    href={link.url}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
} 