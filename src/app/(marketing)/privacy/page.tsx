export const metadata = {
    title: 'Privacy Notice | hky.bio',
    description: 'hky.bio privacy notice — how we collect, use, and protect your personal data.',
};

export default function PrivacyPage() {
    return (
        <>

            <div className="relative max-w-2xl mx-auto px-5 pt-24 pb-16 sm:px-6">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Notice</h1>
                <p className="text-sm text-hky-dim mb-10">Last updated: February 10, 2026</p>

                <div className="space-y-8 text-hky-muted leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Who We Are</h2>
                        <p>
                            hky.bio (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the hky.bio platform — a link-in-bio service built for hockey players. This Privacy Notice explains how we collect, use, store, and protect your personal information when you use our website and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
                        <p className="mb-3">When you join our waitlist or create an account, we may collect:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong className="text-white">Contact information:</strong> email address and full name</li>
                            <li><strong className="text-white">Profile information:</strong> username, age, team name, and league</li>
                            <li><strong className="text-white">Usage data:</strong> pages visited, interactions with the service, and device/browser information</li>
                            <li><strong className="text-white">Cookies:</strong> we use essential cookies to operate the service and analytics cookies to understand usage patterns</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
                        <p className="mb-3">We use the information we collect to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Reserve your chosen username and manage your waitlist position</li>
                            <li>Send you updates about hky.bio&apos;s launch and new features</li>
                            <li>Send occasional offers, news, and promotional content related to hky.bio</li>
                            <li>Improve and develop the hky.bio platform</li>
                            <li>Prevent fraud and ensure the security of our service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Data Sharing</h2>
                        <p>
                            We do not sell your personal information to third parties. We may share your data with trusted service providers who help us operate the platform (e.g., hosting, email delivery, analytics), but only as needed to provide our services and under strict confidentiality obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Data Storage &amp; Security</h2>
                        <p>
                            Your data is stored securely using industry-standard encryption. We use Supabase as our database provider, which employs enterprise-grade security measures including encryption at rest and in transit. We retain your data for as long as your account is active or as needed to provide services to you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
                        <p className="mb-3">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Access the personal data we hold about you</li>
                            <li>Request correction of inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Withdraw consent for marketing communications at any time</li>
                            <li>Request a copy of your data in a portable format</li>
                        </ul>
                        <p className="mt-3">
                            To exercise any of these rights, contact us at <a href="mailto:privacy@hky.bio" className="text-ice-600 hover:underline">privacy@hky.bio</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Marketing Communications</h2>
                        <p>
                            By joining the waitlist, you consent to receive emails about hky.bio&apos;s launch, updates, offers, and news. You can unsubscribe at any time by clicking the &quot;unsubscribe&quot; link in any email we send or by contacting us directly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">8. Children&apos;s Privacy</h2>
                        <p>
                            hky.bio is intended for hockey players of all ages. For users under 16, we recommend that a parent or guardian reviews this privacy notice and supervises the registration process. We do not knowingly collect personal data from children under 13 without parental consent.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">9. Changes to This Notice</h2>
                        <p className="text-hky-muted leading-relaxed">
                            We may update this Privacy Notice from time to time. We will verify changes by posting the new Privacy Notice on this page.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">10. Contact Us</h2>
                        <p className="text-hky-muted leading-relaxed">
                            If you have questions about this Privacy Notice or our data practices, please contact us at <a href="mailto:privacy@hky.bio" className="text-ice-600 hover:underline">privacy@hky.bio</a>.
                        </p>
                    </section>
                </div>
            </div>

        </>
    );
}
