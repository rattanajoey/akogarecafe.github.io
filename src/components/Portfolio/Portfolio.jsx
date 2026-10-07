import React, { useState } from "react";
import {
  ArrowContainer,
  BackgroundContianer,
  CompanyTitle,
  CompanyTitleContainer,
  PortfolioWrapper,
  SKillGrid,
  SkillIcon,
  SkillsContainer,
  SkillsContainerWrapper,
  UserNameContainer,
} from "./style";
import { Box, Grid2, Typography } from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import NextPlanIcon from "@mui/icons-material/NextPlan";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import SyncIcon from "@mui/icons-material/Sync";
import CodeIcon from "@mui/icons-material/Code";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import InsightsIcon from "@mui/icons-material/Insights";
import GridViewIcon from "@mui/icons-material/GridView";
import BugReportIcon from "@mui/icons-material/BugReport";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import LanguageIcon from "@mui/icons-material/Language";
import TerminalIcon from "@mui/icons-material/Terminal";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import BrushIcon from "@mui/icons-material/Brush";

const PortfolioSection = () => {
  const [hoveredCompany, setHoveredCompany] = useState(null);

  const renderSkill = (Icon, title, level, description) => (
    <Grid2 container flexWrap={"nowrap"} size={12}>
      <SkillIcon>
        <Icon fontSize="medium" />
      </SkillIcon>
      <Grid2 container ml={2} gap={"0px"} flexDirection={"column"}>
        <Typography variant="body1">
          <strong>{title}</strong> - {level}
        </Typography>
        <Typography variant="body2">{description}</Typography>
      </Grid2>
    </Grid2>
  );

  return (
    <PortfolioWrapper container>
      <BackgroundContianer>
        <SkillsContainerWrapper container>
          <Grid2 size={{ xs: 12, md: 5 }} mb={{ xs: 0, sm: 2, md: 0 }}>
            <UserNameContainer>
              <Typography variant="h3">Joey Rattana</Typography>
              <Typography variant="h6" mt={1}>
                Class: Frontend Product Engineer
              </Typography>
              <Typography variant="h6">
                Subclass: Experimentation &amp; Performance
              </Typography>
              <Typography variant="body1" color="gray" mt={1}>
                Crafting investor experiences, one quest at a time.
              </Typography>
            </UserNameContainer>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 7 }} mb={6}>
            <SkillsContainer>
              <Typography variant="body1">
                I&apos;m a <strong>frontend product engineer</strong> with 6+
                years across front-end, full-stack, and QA. I build investor
                experiences with <strong>React, Next.js, and TypeScript</strong>,
                focusing on experimentation, performance, and reliable financial
                workflows.
              </Typography>
              <Typography variant="body1" mt={2}>
                Previously, I worked as a{" "}
                <strong>Software Engineer at StartEngine</strong>, where I was
                the sole engineer on the investor-facing website redesign and
                built an in-house experimentation agent. My work also covered
                analytics, regulatory disclosures, campaign pages, and investor
                account workflows.
              </Typography>
              <Typography variant="body1" mt={2}>
                Outside engineering, I&apos;m into anime, gaming, music,
                collecting, filming, and content creation. Akogare Cafe brings
                those interests together through games, music, and community
                projects.
              </Typography>
              <Grid2 container mt={8}>
                <Grid2 size={{ xs: 12, sm: 3 }}>
                  <Typography>Jan 2022 - Oct 2026</Typography>
                </Grid2>
                <CompanyTitleContainer
                  container
                  size={{ xs: 12, sm: 9 }}
                  flexWrap="nowrap"
                  onMouseEnter={() => setHoveredCompany("startengine")}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <CompanyTitle href="http://startengine.com/" target="_blank">
                    Software Engineer · StartEngine
                  </CompanyTitle>
                  <ArrowContainer
                    ishovered={
                      hoveredCompany === "startengine" ? "true" : "false"
                    }
                  >
                    <ArrowOutwardIcon />
                  </ArrowContainer>
                </CompanyTitleContainer>
              </Grid2>
              <Box
                component="ul"
                sx={{ pl: 3, mt: 2, mb: 0, "& li + li": { mt: 1.5 } }}
              >
                <Typography component="li" variant="body1">
                  <strong>Investor experience redesign.</strong> Sole engineer
                  on the redesign of discovery, offering pages, navigation, and
                  a targeted Private experience. A conclusive A/B test with
                  about 10,400 participants guided rollout.
                </Typography>
                <Typography component="li" variant="body1">
                  <strong>Experimentation agent.</strong> Built an in-house agent
                  that replaced a vendor tool and helped plan, size, and monitor
                  A/B tests. Marketing used it to analyze 5+ distinct experiments,
                  with human approval.
                </Typography>
                <Typography component="li" variant="body1">
                  <strong>Analytics accuracy.</strong> Improved purchase-amount
                  tracking from 60.6% to 98.5% of events. Restored new/returning
                  visitor classification to 100% coverage in a post-deploy
                  sample.
                </Typography>
                <Typography component="li" variant="body1">
                  <strong>Performance and discovery.</strong> Used code splitting,
                  caching, and SSR to speed up key pages. Restored internal links
                  to 1,541 offering pages orphaned by an SEO regression.
                </Typography>
              </Box>
              <Typography variant="body2" mt={3}>
                <strong>Additional toolkit:</strong> A/B testing, PostHog,
                Builder.io campaign pages, Playwright, SSR/ISR, accessibility,
                and API integration.
              </Typography>
              <SKillGrid container mt={4} rowSpacing={2}>
                {renderSkill(
                  NextPlanIcon,
                  "Next.js",
                  "Experienced",
                  "Built investor-facing experiences with server rendering, code splitting, caching, and API integration."
                )}
                {renderSkill(
                  BubbleChartIcon,
                  "React",
                  "Expert",
                  "Built reusable interfaces for discovery, offering pages, navigation, and investor workflows."
                )}
                {renderSkill(
                  SyncIcon,
                  "React Query",
                  "Experienced",
                  "Used React Query for data fetching, caching, and synchronization."
                )}
                {renderSkill(
                  ViewQuiltIcon,
                  "Material-UI (MUI)",
                  "Experienced",
                  "Built responsive interfaces with Material UI and customized component themes."
                )}
                {renderSkill(
                  DesignServicesIcon,
                  "Design System",
                  "Expert",
                  "Maintained reusable UI components and centralized regulatory disclosures across four page layouts."
                )}
                {renderSkill(
                  BrushIcon,
                  "Figma",
                  "Intermediate",
                  "Translated Figma mockups into production interfaces."
                )}
                {renderSkill(
                  LanguageIcon,
                  "Webflow",
                  "Expert",
                  "Built and maintained responsive Webflow sites with animations and custom interactions."
                )}
                {renderSkill(
                  SmartToyIcon,
                  "AI-Assisted Development & Research",
                  "Experienced",
                  "Used Claude, Codex, Cursor, Devin, and MCPs for research, debugging, and human-approved engineering workflows."
                )}
                {renderSkill(
                  InsightsIcon,
                  "SEO & Content Quality",
                  "Expert",
                  "Worked on technical SEO, including sitemaps, hreflang, canonicals, and restoring links to orphaned offering pages."
                )}
                {renderSkill(
                  GridViewIcon,
                  "Data Accuracy & Pattern Recognition",
                  "Experienced",
                  "Repaired visitor classification and purchase tracking, using event data and PostHog to investigate discrepancies."
                )}
              </SKillGrid>
              <Grid2 container mt={8}>
                <Grid2 size={{ xs: 12, sm: 3 }}>
                  <Typography>Apr 2019 - Dec 2019</Typography>
                </Grid2>
                <CompanyTitleContainer
                  container
                  size={{ xs: 12, sm: 9 }}
                  flexWrap="nowrap"
                  onMouseEnter={() => setHoveredCompany("isbx")}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <CompanyTitle href="https://www.isbx.com/" target="_blank">
                    Junior Software Developer (Full Stack) · ISBX
                  </CompanyTitle>
                  <ArrowContainer
                    ishovered={hoveredCompany === "isbx" ? "true" : "false"}
                  >
                    <ArrowOutwardIcon />
                  </ArrowContainer>
                </CompanyTitleContainer>
              </Grid2>
              <Typography variant="body1" mt={2}>
                Launched a React Native mobile platform from scratch with device
                and API integration. Delivered a data-centric warehouse
                management web app using Node.js and TypeScript from Figma
                mockups.
              </Typography>
              <SKillGrid container mt={4} rowSpacing={2}>
                {renderSkill(
                  CodeIcon,
                  "TypeScript",
                  "Intermediate",
                  "Built a warehouse management web app with TypeScript and Node.js."
                )}
                {renderSkill(
                  BubbleChartIcon,
                  "React",
                  "Expert",
                  "Developed reusable components, hooks, and state management."
                )}
                {renderSkill(
                  SmartphoneIcon,
                  "React Native",
                  "Intermediate",
                  "Launched a mobile platform from scratch with device integration and API communication."
                )}
                {renderSkill(
                  TerminalIcon,
                  "Node.js",
                  "Intermediate",
                  "Delivered a data-centric warehouse management application with Node.js and TypeScript."
                )}
              </SKillGrid>
              <Grid2 container mt={8}>
                <Grid2 size={{ xs: 12, sm: 3 }}>
                  <Typography>Aug 2018 - Apr 2019</Typography>
                </Grid2>
                <CompanyTitleContainer
                  container
                  size={{ xs: 12, sm: 9 }}
                  flexWrap="nowrap"
                  onMouseEnter={() => setHoveredCompany("isbx-qa")}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <CompanyTitle href="https://www.isbx.com/" target="_blank">
                    Quality Assurance Tester · ISBX
                  </CompanyTitle>
                  <ArrowContainer
                    ishovered={hoveredCompany === "isbx-qa" ? "true" : "false"}
                  >
                    <ArrowOutwardIcon />
                  </ArrowContainer>
                </CompanyTitleContainer>
              </Grid2>
              <Typography variant="body1" mt={2}>
                Tested front-end and back-end releases across multiple apps
                before launch.
              </Typography>
              <SKillGrid container mt={4} rowSpacing={2}>
                {renderSkill(
                  BugReportIcon,
                  "Manual & Automated Testing",
                  "Intermediate",
                  "Conducted functional, regression, and UI tests across web & mobile apps."
                )}
                {renderSkill(
                  FactCheckIcon,
                  "Test Case Development",
                  "Intermediate",
                  "Designed and executed structured test cases to ensure software reliability."
                )}
              </SKillGrid>
              <Grid2 container mt={8}>
                <Grid2 size={{ xs: 12, sm: 3 }}>
                  <Typography>Jul 2017 - Jan 2018</Typography>
                </Grid2>
                <CompanyTitleContainer
                  container
                  size={{ xs: 12, sm: 9 }}
                  flexWrap="nowrap"
                  onMouseEnter={() => setHoveredCompany("appen")}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <CompanyTitle href="https://www.appen.com/" target="_blank">
                    Web Search Evaluator · Appen Global
                  </CompanyTitle>
                  <ArrowContainer
                    ishovered={hoveredCompany === "appen" ? "true" : "false"}
                  >
                    <ArrowOutwardIcon />
                  </ArrowContainer>
                </CompanyTitleContainer>
              </Grid2>
              <Typography variant="body1" mt={2}>
                Rated search results, ads, and content quality to improve
                relevance.
              </Typography>
            </SkillsContainer>
          </Grid2>
        </SkillsContainerWrapper>
      </BackgroundContianer>
    </PortfolioWrapper>
  );
};

export default PortfolioSection;
