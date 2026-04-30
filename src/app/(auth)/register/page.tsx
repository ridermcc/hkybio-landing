import { Suspense } from 'react'
import { RegisterForm } from './RegisterForm'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
    title: 'Join hky.bio',
    description: 'Create your hockey player profile',
}

export default async function RegisterPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams
    const usernameParam = typeof searchParams.username === 'string' ? searchParams.username : ''

    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row bg-hky-black absolute inset-0 z-50">
            {/* Left Side: Form Container */}
            <div className="flex-1 flex flex-col px-6 py-8 md:px-12 lg:px-24 xl:px-32 bg-hky-black relative overflow-y-auto">
                <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-auto pt-4">
                        <Link href="/" className="text-2xl font-black text-white flex items-center gap-2">
                            hky.bio
                        </Link>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 flex flex-col justify-center py-12">
                        <Suspense fallback={<div className="animate-pulse">Loading secure process...</div>}>
                            <RegisterForm initialUsername={usernameParam} />
                        </Suspense>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pb-4 text-center">
                        <p className="text-xs text-hky-muted">
                            Already have an account? <Link href="/login" className="text-white hover:underline font-medium transition-colors">Log in</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Graphic / Branding */}
            <div className="hidden md:flex flex-1 relative bg-hky-surface border-l border-white/5 overflow-hidden items-center justify-center">

                {/* Visual Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-full opacity-60">
                    <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-white/5 blur-[120px]"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[100px]"></div>
                </div>

                {/* Hero Graphic / Text */}
                <div className="relative z-10 px-6 py-10 lg:p-12 max-w-lg text-center flex flex-col items-center">
                    <h2 className="text-2xl lg:text-4xl font-extrabold text-white mb-6 leading-tight tracking-tight italic uppercase">
                        Own Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/50 to-white/20">Narrative.</span>
                    </h2>

                    {/* Phone Mockup */}
                    <div className="relative mx-auto w-[160px] lg:w-[200px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <Image
                            src="/phone-mockup.png"
                            alt="Mobile Profile Mockup"
                            width={200}
                            height={400}
                            className="w-full h-auto drop-shadow-2xl"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
