import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    firstName: string;
    username: string;
    unsubscribeUrl: string;
}

export const WelcomeEmail = ({ firstName, username, unsubscribeUrl }: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Your hky.bio handle is reserved!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Text style={greeting}>Hey {firstName},</Text>
                <Text style={paragraph}>
                    Rider here, co-founder of hky.bio.
                </Text>
                <Section style={reservedSection}>
                    <Text style={reservedLabel}>YOUR HANDLE IS RESERVED:</Text>
                    <Text style={handle}>hky.bio/{username}</Text>
                </Section>
                <Text style={paragraph}>
                    Coaches are discovering players through social media more than ever.
                    We’re building hky.bio to bridge that gap, helping you own your brand and
                    turn your digital presence into career opportunities.
                </Text>
                <Text style={paragraph}>
                    I’m stoked to have you with us from the start.
                </Text>
                <Text style={signature}>
                    Best,<br />
                    <strong>Rider McCallum</strong><br />
                    Co-founder, hky.bio
                </Text>
                <Section style={footer}>
                    <Text style={footerText}>
                        hky.bio, Vancouver, BC<br />
                        <Link href={unsubscribeUrl} style={unsubscribeLink}>
                            Unsubscribe
                        </Link>
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

// Styles
const main = { backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif" };
const container = { padding: "40px 20px" };
const greeting = { fontSize: "18px", lineHeight: "1.5" };
const paragraph = { fontSize: "16px", lineHeight: "1.6", color: "#d1d5db" };
const reservedSection = { margin: "24px 0", padding: "20px", border: "1px solid #333", borderRadius: "8px", textAlign: "center" as const };
const reservedLabel = { fontSize: "12px", color: "#9ca3af", letterSpacing: "1px", margin: "0 0 8px 0" };
const handle = { fontSize: "24px", fontWeight: "bold", color: "#fff", margin: "0" };
const signature = { fontSize: "16px", lineHeight: "1.5", marginTop: "32px" };
const footer = { marginTop: "32px", borderTop: "1px solid #333", paddingTop: "20px" };
const footerText = { fontSize: "12px", color: "#6b7280", textAlign: "left" as const };
const unsubscribeLink = { color: "#6b7280", textDecoration: "underline" };