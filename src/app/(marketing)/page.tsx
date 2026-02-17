import ClaimUsernameInput from '@/components/marketing/ClaimUsernameInput';

export default function Home() {
  return (
    <>

      {/* Hero Section — compact on mobile, centered on desktop */}
      <div className="relative px-5 pt-20 pb-10 sm:px-6 sm:pb-16 lg:px-8 min-h-[calc(100dvh-56px)] flex flex-col justify-center">

        {/* Main headline */}
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-up delay-100">
            The link in bio
            <br />
            <span className="text-gradient">for hockey.</span>
          </h1>

          <p className="text-base sm:text-xl text-hky-muted mb-8 sm:mb-12 animate-fade-up delay-200 max-w-lg mx-auto">
            Your name. Your brand. Your career.
            <br />
            One link. Claim it now.
          </p>

          {/* CTA — Claim Username Input */}
          <div id="claim" className="relative z-10 mb-8 sm:mb-12 animate-fade-up delay-300">
            <ClaimUsernameInput />
          </div>

          {/* Coming Soon Badge - Bottom of screen */}
          <div className="flex justify-center animate-fade-up delay-400">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-hky-surface border border-white/10">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-ice-600 animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-medium text-hky-muted">
                Launching April 2026
              </span>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}