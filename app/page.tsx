import HeroSection from "@/components/HeroSection";
import BrandBannerSlider from "@/components/BrandBannerSlider";
import BentoGrid from "@/components/BentoGrid";
import FeaturedProjects from "@/components/FeaturedProjects";
import VideoScrollSection from "@/components/VideoScrollSection";
import ZoomPortal from "@/components/ZoomPortal";
import StepsSection from "@/components/StepsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import InstagramFeed from "@/components/InstagramFeed";
import CTABanner from "@/components/CTABanner";
import LatestArticles from "@/components/LatestArticles";
import { getProjects, getTestimonials, getSettings, getHomePageArticles, getBrandSliderConfig } from "@/lib/data";
import { getZoomPortalConfig } from "@/lib/zoom-portal-data";
import { getVideoScrollConfig } from "@/lib/video-scroll-data";
import type { VideoScrollPosition } from "@/lib/video-scroll-config";

export default function HomePage() {
  const settings = getSettings();
  const zoomPortalCfg = getZoomPortalConfig();
  const brandSlider = getBrandSliderConfig();
  const videoScrollCfg = getVideoScrollConfig();

  /* Render the scroll-video section at exactly one slot in the page. */
  const renderVideoScroll = (slot: VideoScrollPosition) =>
    videoScrollCfg.enabled && videoScrollCfg.position === slot ? (
      <VideoScrollSection config={videoScrollCfg} />
    ) : null;

  const projects = getProjects()
    .filter((p) => p.featured)
    .map((p) => ({
      _id: p._id,
      title: p.title,
      slug: { current: p.slug },
      category: p.category,
      coverImage: p.coverImage,
    }));

  const testimonials = getTestimonials().map((t) => ({
    _id: t._id,
    clientName: t.clientName,
    quote: t.quote,
    avatar: t.avatar,
    project: t.projectTitle
      ? { title: t.projectTitle, slug: { current: t.projectSlug } }
      : undefined,
  }));

  const latestArticles = getHomePageArticles(settings).map((a) => ({
    _id: a._id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    category: a.category,
    author: a.author,
    createdAt: a.createdAt,
  }));

  return (
    <>
      <HeroSection
        label={settings.heroLabel}
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        cta1Text={settings.heroCta1Text}
        cta1Link={settings.heroCta1Link}
        cta2Text={settings.heroCta2Text}
        cta2Link={settings.heroCta2Link}
        keywordsEnabled={settings.heroKeywordsEnabled}
        keywords={settings.heroKeywords}
      />
      {renderVideoScroll("after-hero")}
      <BentoGrid
        label={settings.aboutLabel}
        title={settings.aboutTitle}
        description={settings.aboutDescription}
        badgeText={settings.bentoBadgeText}
        features={settings.bentoFeatures}
        stats={settings.bentoStats}
        labelSize={settings.sectionLabelSize}
        titleSize={settings.sectionTitleSize}
        bodySize={settings.sectionBodySize}
      />
      {renderVideoScroll("after-bento")}
      {brandSlider.enabled && brandSlider.slides.length > 0 && (
        <BrandBannerSlider config={brandSlider} />
      )}
      {renderVideoScroll("after-brand-slider")}
      <FeaturedProjects
        projects={projects}
        label={settings.projectsLabel}
        title={settings.projectsTitle}
        description={settings.projectsDescription}
        labelSize={settings.sectionLabelSize}
        titleSize={settings.sectionTitleSize}
        bodySize={settings.sectionBodySize}
      />
      {renderVideoScroll("after-projects")}
      {zoomPortalCfg.enabled && <ZoomPortal config={zoomPortalCfg} />}
      {renderVideoScroll("after-zoom-portal")}
      <StepsSection
        labelSize={settings.sectionLabelSize}
        titleSize={settings.sectionTitleSize}
        bodySize={settings.sectionBodySize}
      />
      {renderVideoScroll("after-steps")}
      <TestimonialsSection
        testimonials={testimonials}
        label={settings.testimonialsLabel}
        title={settings.testimonialsTitle}
        labelSize={settings.sectionLabelSize}
        titleSize={settings.sectionTitleSize}
      />
      {renderVideoScroll("after-testimonials")}
      {settings.homeBlogEnabled !== false && latestArticles.length > 0 && (
        <LatestArticles
          articles={latestArticles}
          label={settings.homeBlogLabel}
          title={settings.homeBlogTitle}
          description={settings.homeBlogDescription}
          ctaText={settings.homeBlogCtaText}
          labelSize={settings.sectionLabelSize}
          titleSize={settings.sectionTitleSize}
          bodySize={settings.sectionBodySize}
        />
      )}
      {renderVideoScroll("after-articles")}
      <InstagramFeed />
      <CTABanner />
    </>
  );
}
