const FAQ = () => {
    return (
        <div className='max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-extrabold text-gray-900 text-center'>
                Frequently Asked Questions
            </h2>
            <div className='mt-12 grid gap-6 lg:grid-cols-2'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <h3 className='text-lg font-medium text-gray-900'>
                        How does the 7-day free trial work?
                    </h3>
                    <p className='mt-2 text-gray-600'>
                        You can start using all premium features immediately.
                        We&apos;ll send you a reminder before your trial ends,
                        and you won&apos;t be charged if you cancel before the
                        trial period is over.
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Can I change my plan later?
                    </h3>
                    <p className='mt-2 text-gray-600'>
                        Yes, you can upgrade or downgrade your plan at any time.
                        When upgrading, you&apos;ll only pay the prorated
                        difference. When downgrading, the new rate will apply to
                        your next billing cycle.
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <h3 className='text-lg font-medium text-gray-900'>
                        What payment methods do you accept?
                    </h3>
                    <p className='mt-2 text-gray-600'>
                        We accept all major credit cards, PayPal, and Apple Pay.
                        All transactions are secure and encrypted.
                    </p>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <h3 className='text-lg font-medium text-gray-900'>
                        Is my data secure with Notesy Premium?
                    </h3>
                    <p className='mt-2 text-gray-600'>
                        Absolutely. We use bank-level encryption for all your
                        notes and voice data. Your information is never shared
                        with third parties and is fully encrypted end-to-end.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
