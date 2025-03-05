import React, { useState } from "react";
import {
  ArrowContainer,
  BackgroundContianer,
  CompanyTitle,
  CompanyTitleContainer,
  PortfolioWrapper,
  SkillIcon,
  SkillsContainer,
  UserNameContainer,
} from "./style";
import { Grid2, Typography } from "@mui/material";
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

const PortfolioSection = () => {
  const [hoveredCompany, setHoveredCompany] = useState(null);

  const renderSkill = (Icon, title, level, description) => (
    <Grid2 container flexWrap={"nowrap"} size={9}>
      <SkillIcon>
        <Icon fontSize="medium" />
      </SkillIcon>
      <Grid2 container ml={2} gap={"0px"}>
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
        <Grid2 container pl={28} pr={4} mt={4}>
          <Grid2 size={5}>
            <UserNameContainer>
              <Typography variant="h3">Joey Rattana</Typography>
              <Typography variant="h6" mt={1}>
                Class: Software Engineer
              </Typography>
              <Typography variant="h6">Subclass: Front End</Typography>
              <Typography variant="body1" color="gray" mt={1}>
                A code-wielding artisan, crafting sleek and interactive UI
                realms.
              </Typography>
            </UserNameContainer>
          </Grid2>
          <Grid2 size={7} mb={24}>
            <SkillsContainer>
              <Typography variant="body1">
                I&apos;m a <strong>Software Engineer</strong> with a commitment
                to pixel-perfect precision, speed, and responsive design. My
                approach is simple: deliver exactly what&apos;s designed, down
                to the pixel, within the deadline. Whether it requires
                leveraging my expertise or grinding through new challenges, I
                thrive on building innovative, custom solutions that push the
                boundaries of front-end development.
              </Typography>
              <Typography variant="body1" mt={2}>
                Currently, I&apos;m a{" "}
                <strong>Software Engineer at StartEngine</strong>. I specialize
                in <strong>Next.js, Typescript, React, and React Query</strong>,
                ensuring high-performance, seamless user experiences.
              </Typography>
              <Typography variant="body1" mt={2}>
                In the past, I&apos;ve had the opportunity to develop software
                across a variety of environments—ranging from startups and
                fintech platforms to large corporations and digital agencies.
                I&apos;ve worked on projects spanning{" "}
                <strong>
                  internal business tools, marketplace applications, and mobile
                  companion apps
                </strong>
                . My experience includes both front-end and full-stack
                development, allowing me to build seamless, high-performance
                applications tailored to diverse industries.
              </Typography>
              <Typography variant="body1" mt={2}>
                Beyond development, I&apos;m passionate about anime, gaming,
                music, collecting, filming, and content creation. I apply the
                same attention to detail and innovation in my personal projects
                as I do in my professional work—always striving to create
                experiences that are both visually compelling and technically
                sound.
              </Typography>
              <Grid2 container mt={8}>
                <Grid2 size={3}>
                  <Typography>2022 - Present</Typography>
                </Grid2>
                <CompanyTitleContainer
                  container
                  size={9}
                  onMouseEnter={() => setHoveredCompany("startengine")}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <CompanyTitle href="http://startengine.com/" target="_blank">
                    Software Engineer · StartEngine
                  </CompanyTitle>
                  <ArrowContainer isHovered={hoveredCompany === "startengine"}>
                    <ArrowOutwardIcon />
                  </ArrowContainer>
                </CompanyTitleContainer>
              </Grid2>
              <Grid2 container mt={4} rowSpacing={2}>
                <Grid2 size={3} />
                {renderSkill(
                  NextPlanIcon,
                  "Next.js",
                  "Experienced",
                  "Built SSR & CSR apps, optimized performance, routing, API handling."
                )}
                <Grid2 size={3} />
                {renderSkill(
                  BubbleChartIcon,
                  "React",
                  "Expert",
                  "Developed reusable components, hooks, context, state management."
                )}
                <Grid2 size={3} />
                {renderSkill(
                  SyncIcon,
                  "React Query",
                  "Experienced",
                  "Optimized data fetching, caching, and synchronization."
                )}
              </Grid2>
              <Grid2 container mt={8}>
                <Grid2 size={3}>
                  <Typography>2019 - 2020</Typography>
                </Grid2>
                <CompanyTitleContainer
                  container
                  size={9}
                  onMouseEnter={() => setHoveredCompany("isbx")}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <CompanyTitle href="https://www.isbx.com/" target="_blank">
                    Junior Software Engineer / QA Tester · ISBX
                  </CompanyTitle>
                  <ArrowContainer isHovered={hoveredCompany === "isbx"}>
                    <ArrowOutwardIcon />
                  </ArrowContainer>
                </CompanyTitleContainer>
              </Grid2>
              <Grid2 container mt={4} rowSpacing={2}>
                <Grid2 size={3} />
                {renderSkill(
                  CodeIcon,
                  "TypeScript",
                  "Intermediate",
                  "Built scalable web apps with strong typing and modern ES features."
                )}
                <Grid2 size={3} />
                {renderSkill(
                  BubbleChartIcon,
                  "React",
                  "Expert",
                  "Developed reusable components, hooks, context, state management."
                )}
                <Grid2 size={3} />
                {renderSkill(
                  SmartphoneIcon,
                  "React Native",
                  "Intermediate",
                  "Built a mobile companion app from scratch, integrating native features."
                )}
                <Grid2 size={3} />
                {renderSkill(
                  BugReportIcon,
                  "Manual & Automated Testing",
                  "Intermediate",
                  "Conducted functional, regression, and UI tests across web & mobile apps."
                )}
                <Grid2 size={3} />
                {renderSkill(
                  FactCheckIcon,
                  "Test Case Development",
                  "Intermediate",
                  "Designed and executed structured test cases to ensure software reliability."
                )}
              </Grid2>
              <Grid2 container mt={8}>
                <Grid2 size={3}>
                  <Typography>2019 - 2020</Typography>
                </Grid2>
                <CompanyTitleContainer
                  container
                  size={9}
                  onMouseEnter={() => setHoveredCompany("appen")}
                  onMouseLeave={() => setHoveredCompany(null)}
                >
                  <CompanyTitle href="https://www.appen.com/" target="_blank">
                    Web Search Evaluator · Appen
                  </CompanyTitle>
                  <ArrowContainer isHovered={hoveredCompany === "appen"}>
                    <ArrowOutwardIcon />
                  </ArrowContainer>
                </CompanyTitleContainer>
              </Grid2>
              <Grid2 container mt={4} rowSpacing={2}>
                <Grid2 size={3} />
                {renderSkill(
                  InsightsIcon,
                  "SEO & Content Quality",
                  "Intermediate",
                  "Evaluated ad placements, page rankings, and optimized content discovery."
                )}
                <Grid2 size={3} />
                {renderSkill(
                  GridViewIcon,
                  "Data Accuracy & Pattern Recognition",
                  "Intermediate",
                  "Reviewed large datasets and detected inconsistencies in search relevance."
                )}
              </Grid2>
            </SkillsContainer>
          </Grid2>
        </Grid2>
      </BackgroundContianer>
    </PortfolioWrapper>
  );
};

export default PortfolioSection;
