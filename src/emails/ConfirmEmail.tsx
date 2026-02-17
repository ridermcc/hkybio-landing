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
    Button,
} from "@react-email/components";
import * as React from "react";

interface ConfirmEmailProps {
    confirmationUrl: string;
}

export const ConfirmEmail = ({ confirmationUrl }: ConfirmEmailProps) => (
    <Html>
        <Head />
        <Preview>Confirm your hky.bio account</Preview>
        <Body style={main}>
            <Container style={container}>
                <Text style={greeting}>Welcome to the team,</Text>
                <Text style={paragraph}>
                    You're one step away from accessing your hky.bio profile.
                    Confirm your email address to get started.
                </Text>
                <Section style={buttonContainer}>
                    <Button style={button} href={confirmationUrl}>
                        Confirm Email
                    </Button>
                </Section>
                <Text style={paragraph}>
                    If you didn't create an account, you can safely ignore this email.
                </Text>
                <Section style={footer}>
                    <Text style={footerText}>
                        hky.bio, Vancouver, BC
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

// Styles
const main = { backgroundColor: "#000", color: "#fff", fontFamily: "sans-serif" };
const container = { padding: "40px 20px" };
const greeting = { fontSize: "18px", lineHeight: "1.5", fontWeight: "bold" };
const paragraph = { fontSize: "16px", lineHeight: "1.6", color: "#d1d5db", margin: "24px 0" };
const buttonContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = {
    backgroundColor: "#0ea5e9",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "bold",
    display: "inline-block",
};
const footer = { marginTop: "32px", borderTop: "1px solid #333", paddingTop: "20px" };
const footerText = { fontSize: "12px", color: "#6b7280", textAlign: "left" as const };
