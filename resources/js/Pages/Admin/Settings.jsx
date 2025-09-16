import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Settings({ settings }) {
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        company_name: settings.company_name || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_address: settings.company_address || '',
        email_signature: settings.email_signature || '',
        approval_template: settings.approval_template || 'Your maintenance request has been approved. Our team will arrive as scheduled on {scheduled_date} at {scheduled_time}.',
        rejection_template: settings.rejection_template || 'Unfortunately, we are unable to approve your maintenance request at this time.',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.settings.update'));
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Settings
                </h2>
            }
        >
            <Head title="Settings" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Company Information */}
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Company Information</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        This information will be displayed on maintenance request forms and emails.
                                    </p>
                                    
                                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                        <div className="sm:col-span-3">
                                            <InputLabel htmlFor="company_name" value="Company Name" />
                                            <TextInput
                                                id="company_name"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.company_name}
                                                onChange={(e) => setData('company_name', e.target.value)}
                                            />
                                            <InputError message={errors.company_name} className="mt-2" />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <InputLabel htmlFor="company_email" value="Company Email" />
                                            <TextInput
                                                id="company_email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                value={data.company_email}
                                                onChange={(e) => setData('company_email', e.target.value)}
                                            />
                                            <InputError message={errors.company_email} className="mt-2" />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <InputLabel htmlFor="company_phone" value="Company Phone" />
                                            <TextInput
                                                id="company_phone"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.company_phone}
                                                onChange={(e) => setData('company_phone', e.target.value)}
                                            />
                                            <InputError message={errors.company_phone} className="mt-2" />
                                        </div>

                                        <div className="sm:col-span-6">
                                            <InputLabel htmlFor="company_address" value="Company Address" />
                                            <TextArea
                                                id="company_address"
                                                className="mt-1 block w-full"
                                                value={data.company_address}
                                                onChange={(e) => setData('company_address', e.target.value)}
                                                rows={3}
                                            />
                                            <InputError message={errors.company_address} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Email Templates */}
                                <div className="pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Email Templates</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Customize the email templates sent to tenants.
                                    </p>
                                    
                                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4">
                                        <div>
                                            <InputLabel htmlFor="email_signature" value="Email Signature" />
                                            <TextArea
                                                id="email_signature"
                                                className="mt-1 block w-full"
                                                value={data.email_signature}
                                                onChange={(e) => setData('email_signature', e.target.value)}
                                                rows={3}
                                            />
                                            <InputError message={errors.email_signature} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="approval_template" value="Approval Email Template" />
                                            <p className="text-xs text-gray-500 mb-1">
                                                Available variables: {'{tenant_name}'}, {'{work_order_number}'}, {'{scheduled_date}'}, {'{scheduled_time}'}
                                            </p>
                                            <TextArea
                                                id="approval_template"
                                                className="mt-1 block w-full"
                                                value={data.approval_template}
                                                onChange={(e) => setData('approval_template', e.target.value)}
                                                rows={4}
                                            />
                                            <InputError message={errors.approval_template} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="rejection_template" value="Rejection Email Template" />
                                            <p className="text-xs text-gray-500 mb-1">
                                                Available variables: {'{tenant_name}'}, {'{work_order_number}'}
                                            </p>
                                            <TextArea
                                                id="rejection_template"
                                                className="mt-1 block w-full"
                                                value={data.rejection_template}
                                                onChange={(e) => setData('rejection_template', e.target.value)}
                                                rows={4}
                                            />
                                            <InputError message={errors.rejection_template} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center justify-end">
                                    {recentlySuccessful && (
                                        <p className="text-sm text-green-600 mr-3">Saved successfully.</p>
                                    )}
                                    <PrimaryButton disabled={processing}>
                                        Save Settings
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 