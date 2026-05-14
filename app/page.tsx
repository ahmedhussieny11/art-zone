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

export default function HomePage() {
  const settings = getSettings();
  const zoomPortalCfg = getZoomPortalConfig();
  const brandSlider = getBrandSliderConfig();
  const videoScrollCfg = getVideoScrollConfig();

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
      {brandSlider.enabled && brandSlider.slides.length > 0 && (
        <BrandBannerSlider config={brandSlider} />
      )}
      <FeaturedProjects
        projects={projects}
        label={settings.projectsLabel}
        title={settings.projectsTitle}
        description={settings.projectsDescription}
        labelSize={settings.sectionLabelSize}
        titleSize={settings.sectionTitleSize}
        bodySize={settings.sectionBodySize}
      />
      {videoScrollCfg.enabled && <VideoScrollSection config={videoScrollCfg} />}
      {zoomPortalCfg.enabled && <ZoomPortal config={zoomPortalCfg} />}
      <StepsSection
        labelSize={settings.sectionLabelSize}
        titleSize={settings.sectionTitleSize}
        bodySize={settings.sectionBodySize}
      />
      <TestimonialsSection
        testimonials={testimonials}
        label={settings.testimonialsLabel}
        title={settings.testimonialsTitle}
        labelSize={settings.sectionLabelSize}
        titleSize={settings.sectionTitleSize}
      />
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
      <InstagramFeed />
      <CTABanner />
    </>
  );
}
