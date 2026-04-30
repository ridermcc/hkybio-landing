import ClaimUsernameInput from '@/components/marketing/ClaimUsernameInput';

export default function Home() {
  return (
    <>

      {/* Hero Section — compact on mobile, centered on desktop */}
      <div className="relative px-5 pt-20 pb-10 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8 lg:pt-32 min-h-[calc(100dvh-56px)] flex flex-col justify-center">

        {/* Main headline */}
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-up delay-100">
            The link in bio
            <br />
            for hockey.
          </h1>

          <p className="text-base sm:text-xl text-hky-muted mb-8 sm:mb-12 animate-fade-up delay-200 max-w-lg mx-auto">
            Your name. Your brand. Your career.
            <br />
            Connect it all with one link.
          </p>

          {/* CTA — Claim Username Input */}
          <div id="claim" className="relative z-10 mb-8 sm:mb-12 animate-fade-up delay-300">
            <ClaimUsernameInput />
          </div>
        </div>
      </div>

    </>
  );
}