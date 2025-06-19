import { Suspense } from 'react';
import VerifyEmailPageContent from './VerifyEmailPageContent';

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading verification page...</div>}>
            <VerifyEmailPageContent />
        </Suspense>
    );
}
