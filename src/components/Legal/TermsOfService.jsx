import React from "react";
import { Box, Typography, Container, Paper, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";

const TermsWrapper = styled(Box)({
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

const TermsOfService = () => {
  return (
    <TermsWrapper>
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
          Terms of Service
        </Typography>

        <StyledPaper>
          <Typography variant="body2" color="gray" gutterBottom>
            Last Updated: {new Date().toLocaleDateString()}
          </Typography>

          <Typography variant="h4" gutterBottom color="white" sx={{ mt: 3 }}>
            Agreement to Terms
          </Typography>
          <Typography variant="body1" paragraph color="white">
            By accessing and using Akogare Cafe (akogarecafe.github.io), you
            accept and agree to be bound by the terms and provision of this
            agreement. If you do not agree to abide by the above, please do not
            use this service.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Use License
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Permission is granted to temporarily download one copy of the
            materials on Akogare Cafe's website for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </Typography>
          <Typography variant="body1" paragraph color="white">
            • Modify or copy the materials
            <br />
            • Use the materials for any commercial purpose or for any public
            display
            <br />
            • Attempt to reverse engineer any software contained on the website
            <br />• Remove any copyright or other proprietary notations from the
            materials
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            User Content and Conduct
          </Typography>
          <Typography variant="h6" gutterBottom color="#4ecdc4" sx={{ mt: 2 }}>
            Movie Club Submissions
          </Typography>
          <Typography variant="body1" paragraph color="white">
            When submitting movie recommendations or participating in
            discussions, you agree to:
            <br />• Provide accurate and appropriate content
            <br />• Respect copyright laws and intellectual property rights
            <br />• Avoid offensive, harmful, or inappropriate content
            <br />• Respect other community members
          </Typography>

          <Typography variant="h6" gutterBottom color="#4ecdc4" sx={{ mt: 2 }}>
            Prohibited Uses
          </Typography>
          <Typography variant="body1" paragraph color="white">
            You may not use our service:
            <br />• For any unlawful purpose or to solicit others to perform
            unlawful acts
            <br />• To violate any international, federal, provincial, or state
            regulations, rules, laws, or local ordinances
            <br />• To transmit or procure the sending of any advertising or
            promotional material without our prior written consent
            <br />• To impersonate or attempt to impersonate the company, an
            employee, another user, or any other person or entity
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Interactive Features
          </Typography>
          <Typography variant="h6" gutterBottom color="#4ecdc4" sx={{ mt: 2 }}>
            Shogi Game
          </Typography>
          <Typography variant="body1" paragraph color="white">
            The interactive Shogi game is provided for entertainment purposes.
            While we strive for accuracy in game rules and mechanics, we make no
            warranties about the completeness or accuracy of the game
            implementation.
          </Typography>

          <Typography variant="h6" gutterBottom color="#4ecdc4" sx={{ mt: 2 }}>
            Third-Party Content
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Our website displays content from third-party services including
            YouTube, Twitch, and music platforms. We are not responsible for the
            content, accuracy, or opinions expressed in such materials, and such
            materials do not necessarily reflect our views or opinions.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Advertising and Third-Party Services
          </Typography>
          <Typography variant="body1" paragraph color="white">
            This website uses Google AdSense to display advertisements. By using
            our website, you agree to the display of these advertisements. We do
            not control the content of these advertisements and are not
            responsible for their content.
          </Typography>
          <Typography variant="body1" paragraph color="white">
            Our website integrates with various third-party services (YouTube,
            Twitch, Firebase, etc.). Your use of these services is subject to
            their respective terms of service and privacy policies.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Intellectual Property Rights
          </Typography>
          <Typography variant="body1" paragraph color="white">
            The service and its original content, features, and functionality
            are and will remain the exclusive property of Akogare Cafe and its
            licensors. The service is protected by copyright, trademark, and
            other laws. Our trademarks and trade dress may not be used in
            connection with any product or service without our prior written
            consent.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Disclaimer
          </Typography>
          <Typography variant="body1" paragraph color="white">
            The materials on Akogare Cafe's website are provided on an 'as is'
            basis. Akogare Cafe makes no warranties, expressed or implied, and
            hereby disclaims and negates all other warranties including without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Limitations
          </Typography>
          <Typography variant="body1" paragraph color="white">
            In no event shall Akogare Cafe or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use the materials on Akogare Cafe's website, even if
            Akogare Cafe or an authorized representative has been notified
            orally or in writing of the possibility of such damage.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Accuracy of Materials
          </Typography>
          <Typography variant="body1" paragraph color="white">
            The materials appearing on Akogare Cafe's website could include
            technical, typographical, or photographic errors. Akogare Cafe does
            not warrant that any of the materials on its website are accurate,
            complete, or current. Akogare Cafe may make changes to the materials
            contained on its website at any time without notice.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Termination
          </Typography>
          <Typography variant="body1" paragraph color="white">
            We may terminate or suspend your access to our service immediately,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph color="white">
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material, we will try to
            provide at least 30 days notice prior to any new terms taking
            effect.
          </Typography>

          <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.1)" }} />

          <Typography variant="h4" gutterBottom color="white">
            Contact Information
          </Typography>
          <Typography variant="body1" color="white">
            If you have any questions about these Terms of Service, please
            contact us through our contact page or via our social media channels
            listed on the website.
          </Typography>
        </StyledPaper>
      </Container>
    </TermsWrapper>
  );
};

export default TermsOfService;
