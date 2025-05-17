import { Plan } from '@/types/types';
import { Check } from 'lucide-react';

interface PricingPlansProps {
    plans: Plan[];
    selectedPlan: string;
    onPlanSelect: (planId: string) => void;
    onSubscribe: () => void;
    isLoading: boolean;
    error: string | null;
}

const PricingPlans: React.FC<PricingPlansProps> = ({
    plans,
    selectedPlan,
    onPlanSelect,
    onSubscribe,
    isLoading,
    error,
}) => {
    const currentPlan = plans.find((plan) => plan.id === selectedPlan);

    return (
        <div className='max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8'>
            <div className='sm:flex sm:flex-col sm:align-center'>
                <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
                    Choose Your Premium Plan
                </h2>
                <p className='mt-5 text-xl text-gray-500 max-w-2xl mx-auto'>
                    Select the plan that fits your needs and unlock all premium
                    features.
                </p>
            </div>

            <div className='mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        isSelected={selectedPlan === plan.id}
                        onSelect={onPlanSelect}
                    />
                ))}
            </div>

            <div className='mt-12 flex justify-center flex-col items-center'>
                {error && (
                    <div className='mb-4 p-4 bg-red-50 text-red-700 rounded-md'>
                        {error}
                    </div>
                )}
                <SubscribeButton
                    onClick={onSubscribe}
                    isLoading={isLoading}
                    plan={currentPlan}
                />
            </div>

            <div className='mt-8 text-center'>
                <p className='text-sm text-gray-500'>
                    All plans include a 7-day free trial. No credit card
                    required until trial ends.
                </p>
                <p className='mt-2 text-xs text-gray-400'>
                    Secure payment processing powered by Stripe
                </p>
            </div>
        </div>
    );
};

const PlanCard: React.FC<{
    plan: Plan;
    isSelected: boolean;
    onSelect: (planId: string) => void;
}> = ({ plan, isSelected, onSelect }) => {
    return (
        <div
            className={`rounded-lg shadow-md divide-y divide-gray-200 flex flex-col ${
                plan.popular
                    ? 'border-2 border-indigo-500 ring-2 ring-indigo-200'
                    : 'border border-gray-200'
            } ${isSelected ? 'bg-indigo-50' : 'bg-white'}`}
        >
            {plan.popular && (
                <div className='bg-indigo-500 text-white text-xs font-semibold py-1 px-3 rounded-t-lg text-center'>
                    MOST POPULAR
                </div>
            )}
            <div className='p-6'>
                <h3 className='text-lg font-medium text-gray-900'>
                    {plan.name}
                </h3>
                <p className='mt-2 text-sm text-gray-500'>{plan.description}</p>
                <p className='mt-4'>
                    <span className='text-3xl font-extrabold text-gray-900'>
                        ₹{plan.price}
                    </span>
                    <span className='text-base font-medium text-gray-500'>
                        /{plan.duration}
                    </span>
                </p>
                {plan.savePercent && (
                    <p className='mt-1 text-sm text-green-600 font-medium'>
                        Save {plan.savePercent}% compared to monthly
                    </p>
                )}
            </div>
            <div className='pt-6 pb-8 px-6'>
                <h4 className='text-sm font-medium text-gray-900 tracking-wide uppercase'>
                    What&apos;s included
                </h4>
                <ul className='mt-4 space-y-3'>
                    {plan.features.map((feature: string, index: number) => (
                        <li
                            key={index}
                            className='flex items-start'
                        >
                            <div className='flex-shrink-0'>
                                <Check className='h-5 w-5 text-green-500' />
                            </div>
                            <p className='ml-3 text-sm text-gray-700'>
                                {feature}
                            </p>
                        </li>
                    ))}
                </ul>
                <div className='mt-8'>
                    <button
                        type='button'
                        className={`block w-full py-3 px-4 rounded-md shadow ${
                            isSelected
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600'
                        } text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        onClick={() => onSelect(plan.id)}
                    >
                        {isSelected ? 'Selected' : 'Select Plan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SubscribeButton: React.FC<{
    onClick: () => void;
    isLoading: boolean;
    plan?: Plan;
}> = ({ onClick, isLoading, plan }) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
        >
            {isLoading ? (
                <>
                    <svg
                        className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                    >
                        <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                        ></circle>
                        <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                    </svg>
                    Processing...
                </>
            ) : (
                `Subscribe Now - ₹${plan?.price}/${plan?.duration}`
            )}
        </button>
    );
};

export default PricingPlans;
