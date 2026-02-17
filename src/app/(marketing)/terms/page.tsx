export const metadata = {
    title: 'Terms & Conditions | hky.bio',
    description: 'hky.bio terms and conditions of use.',
};

export default function TermsPage() {
    return (
        <>

            <div className="relative max-w-2xl mx-auto px-5 pt-24 pb-16 sm:px-6">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms &amp; Conditions</h1>
                <p className="text-sm text-hky-dim mb-10">Last updated: February 10, 2026</p>

                <div className="space-y-8 text-hky-muted leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the hky.bio website and services (&quot;the Service&quot;), you agree to be bound by these Terms &amp; Conditions (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                        <p>
                            hky.bio is a link-in-bio platform designed for hockey players. The Service allows users to create a personalized profile page to share stats, highlights, and information with scouts, coaches, and fans. The Service is currently in pre-launch, and joining the waitlist reserves your preferred username for when the platform goes live.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Waitlist &amp; Username Reservation</h2>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                            <li>Joining the waitlist is free and does not guarantee a specific launch date.</li>
                            <li>Usernames are reserved on a first-come, first-served basis.</li>
                            <li>We reserve the right to reclaim usernames that are inactive, misleading, infringe trademarks, or violate these Terms.</li>
                            <li>Username reservations may expire if you do not activate your account within 30 days of the platform&apos;s launch.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. User Accounts</h2>
                        <p className="mb-3">When creating an account or joining the waitlist, you agree to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Provide accurate and truthful information</li>
                            <li>Keep your account credentials secure</li>
                            <li>Not create accounts for the purpose of impersonating others</li>
                            <li>Not create multiple accounts to reserve multiple usernames</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
                        <p className="mb-3">You agree not to use the Service to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Post content that is illegal, harmful, threatening, abusive, or discriminatory</li>
                            <li>Infringe on intellectual property rights of others</li>
                            <li>Distribute spam or unsolicited communications</li>
                            <li>Attempt to gain unauthorized access to the Service or its systems</li>
                            <li>Use automated tools to scrape or interact with the Service without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h2>
                        <p>
                            The hky.bio name, logo, design, and all related intellectual property are owned by hky.bio. You retain ownership of content you upload to your profile, but grant hky.bio a non-exclusive, worldwide license to display and distribute that content as part of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Communications</h2>
                        <p>
                            By joining the waitlist, you consent to receive transactional emails (e.g., account confirmations, launch updates) and marketing communications (e.g., offers, news, feature announcements). You may opt out of marketing communications at any time via the unsubscribe link in our emails.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
                        <p>
                            The Service is provided &quot;as is&quot; without warranties of any kind. hky.bio shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid to use the Service (if any).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
                        <p>
                            We reserve the right to suspend or terminate your account at any time if you violate these Terms. You may delete your account and data at any time by contacting us at <a href="mailto:support@hky.bio" className="text-ice-600 hover:underline">support@hky.bio</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">10. Changes to Terms</h2>
                        <p>
                            We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the updated Terms. We will notify you of material changes via email.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">11. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from or related to these Terms or the Service shall be resolved through good-faith negotiation, and if necessary, binding arbitration.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">12. Contact Us</h2>
                        <p>
                            For questions about these Terms, please contact us at <a href="mailto:support@hky.bio" className="text-ice-600 hover:underline">support@hky.bio</a>.
                        </p>
                    </section>
                </div>
            </div>

        </>
    );
}
