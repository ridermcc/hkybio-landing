import { Suspense } from 'react';
import ClaimForm from '@/components/marketing/ClaimForm';

export const metadata = {
    title: 'Claim Your Name | hky.bio',
    description: 'Reserve your hky.bio username before someone else does.',
};

export default function ClaimPage() {
    return (
        <>

            <div className="relative px-5 pt-16 pb-10 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8 min-h-[100dvh] flex flex-col justify-center">
                {/* Claim Form */}
                <div className="relative z-10">
                    <Suspense fallback={
                        <div className="w-full max-w-lg mx-auto text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-ice-700/30 border-t-ice-700 animate-spin"></div>
                            <p className="text-xl text-hky-muted">Loading...</p>
                        </div>
                    }>
                        <ClaimForm />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
