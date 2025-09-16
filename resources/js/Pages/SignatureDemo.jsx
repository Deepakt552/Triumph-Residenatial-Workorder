import React from 'react';
import { Head } from '@inertiajs/react';
import SignaturePad from '@/Components/SignatureCanvas';

export default function SignatureDemo() {
    const handleSave = (dataURL) => {
        console.log('Signature saved:', dataURL);
        // You can send this dataURL to your backend or perform other actions
    };

    return (
        <>
            <Head title="Digital Signature Demo" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-6">Digital Signature Demo</h1>
                            <p className="mb-4">Please sign below and click "Save Signature" to download your signature as a PNG file.</p>
                            <SignaturePad onSave={handleSave} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 