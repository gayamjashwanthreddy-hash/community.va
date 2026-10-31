import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollProgress from "@/components/motion/ScrollProgress";
import BrandIntro from "@/components/motion/BrandIntro";
import CinematicNavbar from "@/components/motion/CinematicNavbar";
import HeroScene from "@/components/motion/HeroScene";
import CommunityScene from "@/components/motion/CommunityScene";
import ActivityScene from "@/components/motion/ActivityScene";
import TransformationScene from "@/components/motion/TransformationScene";
import EcosystemScene from "@/components/motion/EcosystemScene";
import EventScene from "@/components/motion/EventScene";
import JoinScene from "@/components/motion/JoinScene";
import FinalScene from "@/components/motion/FinalScene";

export default function Home() {
  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-brand-bg text-brand-dark selection:bg-brand-blue selection:text-white">
        
        {/* Scene 00: Initial Calibration Brand Intro */}
        <BrandIntro />

        {/* Global Progress Calibration Bar */}
        <ScrollProgress />

        {/* Persistent Cinematic Navigation */}
        <CinematicNavbar />

        <main>
          {/* Scene 01: Pinned Immersive Hero */}
          <HeroScene />

          {/* Scene 02: Pinned Developing Geometric Network */}
          <CommunityScene />

          {/* Scene 03: Pinned Full-Screen Five Activity Spheres */}
          <ActivityScene />

          {/* Scene 04: Pinned Horizontal Scrubbed Progression (LEARN -> CREATE -> EXPERIENCE) */}
          <TransformationScene />

          {/* Scene 05: Pinned Connected Community Ecosystem Diagram */}
          <EcosystemScene />

          {/* Scene 06: Cinematic Event Showcase */}
          <EventScene />

          {/* Scene 07: Four Registration Pathways */}
          <JoinScene />

          {/* Scene 08: Final Brand Statement, Contact Form & Minimal Footer */}
          <FinalScene />
        </main>

      </div>
    </SmoothScroll>
  );
}
