import React from "react";
import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";

const PrivacyWrapper = styled(Box)({
  backgroundColor: "#000",
  minHeight: "100vh",
  color: "white",
  paddingTop: "2rem",
  paddingBottom: "2rem",
});

const StyledPaper = styled(Paper)({
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  padding: "2rem",
  marginBottom: "2rem",
});

const PrivacyPolicy = () => {
  return (
    <PrivacyWrapper>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            marginBottom: 4,
            color: "white",
            fontWeight: "bold",
          }}
        >
          Privacy Policy
        </Typography>

        <StyledPaper>
          <Typography variant="body2" color="gray" gutterBottom>
            Last Updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h4" gutterBottom color="white" sx={{ mt: 3 }}>
            Introduction
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Welcome to Akogare Cafe ("we," "our," or "us"). This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website akogarecafe.github.io (the
            "Service"). Please read this Privacy Policy carefully.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Information We Collect
          </Typography>

          <Typography variant="h6" gutterBottom color="#4ecdc4" sx={{ mt: 2 }}>
            Information You Provide
          </Typography>
          <Typography variant="body1" paragraph color="white">
            • Contact information when you reach out to us
            <br />
            • Movie submissions and preferences in our Movie Club section
            <br />• Any other information you voluntarily provide through our
            contact forms or interactions
          </Typography>

          <Typography variant="h6" gutterBottom color="#4ecdc4" sx={{ mt: 2 }}>
            Automatically Collected Information
          </Typography>
          <Typography variant="body1" paragraph color="white">
            • Log data (IP address, browser type, pages visited, time spent)
            <br />
            • Cookies and similar tracking technologies
            <br />
            • Device information (operating system, screen resolution)
            <br />• Usage patterns and site navigation data
          </Typography>

          <Typography variant="h6" gutterBottom color="#4ecdc4" sx={{ mt: 2 }}>
            Third-Party Services
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Our website integrates with several third-party services that may
            collect information:
            <br />• Google AdSense for advertising
            <br />• YouTube API for video content
            <br />• Twitch API for streaming status
            <br />• Firebase for backend services
            <br />• Google Analytics for website analytics
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph color="white">
            We use the collected information for the following purposes:
            <br />• To provide and maintain our Service
            <br />• To improve user experience and website functionality
            <br />• To communicate with you regarding your inquiries
            <br />• To display relevant advertisements through Google AdSense
            <br />• To analyze website usage and optimize performance
            <br />• To comply with legal obligations
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Google AdSense and Advertising
          </Typography>
          <Typography variant="body1" paragraph color="white">
            This website uses Google AdSense to display advertisements. Google
            AdSense uses cookies to serve ads based on your visits to this site
            and other sites on the Internet. You may opt out of personalized
            advertising by visiting Google's Ads Settings page.
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Third-party vendors, including Google, use cookies to serve ads
            based on a user's prior visits to this website. Users may opt out of
            Google's use of cookies by visiting the Google advertising opt-out
            page.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Cookies and Tracking Technologies
          </Typography>
          <Typography variant="body1" paragraph color="white">
            We use cookies and similar tracking technologies to enhance your
            browsing experience. Cookies are small data files stored on your
            device that help us improve our services and provide personalized
            content.
          </Typography>
          <Typography variant="body1" paragraph color="white">
            You can control cookies through your browser settings. However,
            disabling cookies may affect the functionality of certain parts of
            our website.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Information Sharing and Disclosure
          </Typography>
          <Typography variant="body1" paragraph color="white">
            We do not sell, trade, or otherwise transfer your personal
            information to third parties except in the following circumstances:
            <br />• With your consent
            <br />• To comply with legal requirements
            <br />• To protect our rights and safety
            <br />• With service providers who assist in operating our website
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Data Security
          </Typography>
          <Typography variant="body1" paragraph color="white">
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction. However, no method of transmission over the Internet is
            100% secure.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Your Rights
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Depending on your location, you may have certain rights regarding
            your personal information:
            <br />• Right to access your personal data
            <br />• Right to correct inaccurate information
            <br />• Right to delete your personal data
            <br />• Right to restrict processing
            <br />• Right to data portability
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Children's Privacy
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Our Service is not intended for children under 13. We do not
            knowingly collect personal information from children under 13. If
            you become aware that a child has provided us with personal
            information, please contact us immediately.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Changes to This Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph color="white">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the "Last Updated" date.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Contact Us
          </Typography>
          <Typography variant="body1" color="white">
            If you have any questions about this Privacy Policy, please contact
            us through our contact page or via our social media channels listed
            on the website.
          </Typography>
        </StyledPaper>
      </Container>
    </PrivacyWrapper>
  );
};

export default PrivacyPolicy;
