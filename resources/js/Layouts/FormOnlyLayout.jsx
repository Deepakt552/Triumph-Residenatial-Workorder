import React from 'react';

export default function FormOnlyLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <main className="w-full">{children}</main>
        </div>
    );
} 