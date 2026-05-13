import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJson(filename, defaultValue);
    return defaultValue;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export interface Project {
  _id: string;
  title: string;
  slug: string;
  category: string;
  coverImage: string | null;
  concept: string;
  gallery: string[];
  beforeImage: string | null;
  afterImage: string | null;
  materials: string[];
  featured: boolean;
  createdAt: string;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface Testimonial {
  _id: string;
  clientName: string;
  quote: string;
  avatar: string | null;
  projectTitle: string;
  projectSlug: string;
}

export interface Message {
  _id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  budget: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SiteSettings {
  logo: string | null;
  siteName: string;
  siteDescription: string;
  headerCtaText: string;
  headerCtaLink: string;
  footerText: string;
  copyrightText: string;
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappEnabled: boolean;
  email: string;
  address: string;
  addressNote: string;
  instagramHandle: string;
  workingHours: string;
  closedDays: string;
  googleMapsUrl: string;
  googleMapsEnabled: boolean;
  contactPageTitle: string;
  contactPageSubtitle: string;
  contactFormTitle: string;
  contactFormSubtitle: string;
  /** placeholder حقل الجوال في نموذج اتصل بنا */
  contactPhonePlaceholder: string;
  /** خيارات «نوع الخدمة» في النموذج (ترتيب العرض) */
  contactServiceOptions: string[];
  /** خيارات «نطاق الميزانية» في النموذج */
  contactBudgetRanges: string[];
  contactWhatsappTitle: string;
  contactWhatsappCta: string;
  contactWhatsappHint: string;
  contactEmailTitle: string;
  contactStudioTitle: string;
  contactHoursTitle: string;
  fontScale: number;
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta1Text: string;
  heroCta1Link: string;
  heroCta2Text: string;
  heroCta2Link: string;
  aboutLabel: string;
  aboutTitle: string;
  aboutDescription: string;
  projectsLabel: string;
  projectsTitle: string;
  projectsDescription: string;
  testimonialsLabel: string;
  testimonialsTitle: string;
  ctaBannerTitle: string;
  ctaBannerDescription: string;
  ctaBannerButtonText: string;
  sectionLabelSize: string;
  sectionTitleSize: string;
  sectionBodySize: string;
  socialSectionEnabled: boolean;
  socialSectionLabel: string;
  socialSectionTitle: string;
  socialSectionDescription: string;
  socialSectionImages: string[];
  socialSectionButtonText: string;
  socialSectionClickAction: "lightbox" | "link";
  socialSectionCustomLink: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    snapchat: string;
    linkedin: string;
  };
  socialLinksShow: {
    instagram: boolean;
    facebook: boolean;
    twitter: boolean;
    tiktok: boolean;
    youtube: boolean;
    snapchat: boolean;
    linkedin: boolean;
  };
  servicesPageLabel: string;
  servicesPageTitle: string;
  servicesPageDescription: string;
  servicesPageButtonText: string;
  heroKeywordsEnabled: boolean;
  heroKeywords: string[];
  bentoBadgeText: string;
  bentoFeatures: { title: string; description: string; icon: string }[];
  bentoStats: { value: string; label: string }[];
  processLabel: string;
  processTitle: string;
  processDescription: string;
  processSteps: { step: string; title: string; description: string }[];
  colors: {
    offwhite: string;
    charcoal: string;
    warmgray: string;
    gold: string;
    goldLight: string;
    goldDark: string;
  };
  servicesColors: {
    heroBg: string;
    heroText: string;
    cardBg: string;
    cardText: string;
    processBg: string;
  };
  projectCategories: { value: string; label: string }[];
  articleCategories: { value: string; label: string }[];
  /* ── ZoomPortal ── */
  zoomPortalEnabled: boolean;
  zoomPortalScrollHeight: string;
  zoomPortalBgColor: string;
  zoomPortalVignetteOpacity: number;
  zoomPortalGrainOpacity: number;
  zoomPortalAccentColor: string;
  zoomPortalTopBadge: string;
  zoomPortalTopHint: string;
  zoomPortalFinalTitle: string;
  zoomPortalFinalTitleColor: string;
  zoomPortalFinalSub: string;
  zoomPortalFinalSubColor: string;
  zoomPortalCta1Text: string;
  zoomPortalCta1Link: string;
  zoomPortalCta1Bg: string;
  zoomPortalCta1Color: string;
  zoomPortalCta2Text: string;
  zoomPortalCta2Link: string;
  zoomPortalCta2Color: string;
  zoomPortalLayer1Src: string;
  zoomPortalLayer1Label: string;
  zoomPortalLayer1ZoomOrigin: string;
  zoomPortalLayer2Src: string;
  zoomPortalLayer2Label: string;
  zoomPortalLayer2ZoomOrigin: string;
  zoomPortalLayer3Src: string;
  zoomPortalLayer3Label: string;
  zoomPortalLayer3ZoomOrigin: string;
  /** قسم المدونة في الصفحة الرئيسية */
  homeBlogEnabled: boolean;
  homeBlogLabel: string;
  homeBlogTitle: string;
  homeBlogDescription: string;
  /** عند التلقائي: عدد المقالات (١–٦) */
  homeBlogLimit: number;
  homeBlogCtaText: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    _id: "1",
    title: "فيلا عصرية",
    slug: "modern-villa-interior",
    category: "residential",
    coverImage: null,
    concept: "مشروع سكني معاصر يمزج بين الجماليات البسيطة والمواد الطبيعية الدافئة. يركز التصميم على المساحات المفتوحة والخطوط النظيفة ولوحة ألوان محايدة مع لمسات من الذهب الشامبانيا.",
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["رخام إيطالي", "خشب بلوط", "نحاس مصقول", "كتان"],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "مكتب فاخر",
    slug: "luxury-office-space",
    category: "commercial",
    coverImage: null,
    concept: "بيئة مكتبية تنفيذية مصممة لإلهام الإنتاجية مع الحفاظ على أجواء الأناقة الراقية. المواد الفاخرة والأثاث المصمم خصيصاً يحددان كل زاوية.",
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["قشرة جوز", "زجاج مدخن", "جلد", "نحاس"],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    title: "مجلس كلاسيكي",
    slug: "classic-majlis-design",
    category: "classic",
    coverImage: null,
    concept: "مجلس تقليدي أُعيد تصوره بحرفية كلاسيكية وأقمشة فاخرة. تتمازج النقوش المزخرفة مع لمسات عصرية دقيقة لخلق مساحة تحترم التراث وتحتضن الراحة.",
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["قماش حريري", "ذهب عيار", "كريستال", "خشب منحوت"],
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "4",
    title: "لوبي فندق بوتيك",
    slug: "boutique-hotel-lobby",
    category: "commercial",
    coverImage: null,
    concept: "لوبي مميز لفندق بوتيك، مصمم لجذب الضيوف من لحظة وصولهم. إضاءة درامية وقطع فنية منتقاة وأثاث فاخر يخلقون انطباعاً أولياً لا يُنسى.",
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["ترافيرتين", "مخمل", "برونز معتق", "أونيكس"],
    featured: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "5",
    title: "بنتهاوس عصري",
    slug: "modern-penthouse-suite",
    category: "modern",
    coverImage: null,
    concept: "بنتهاوس في أعالي المدينة حيث تلتقي النوافذ الممتدة من الأرض إلى السقف بالتصميم العصري الأنيق.",
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["خرسانة مصقولة", "فولاذ أسود", "بلوط أبيض", "زجاج"],
    featured: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "6",
    title: "ترميم قصر تراثي",
    slug: "heritage-palace-renovation",
    category: "classic",
    coverImage: null,
    concept: "ترميم دقيق لقصر تراثي يحافظ على عظمته التاريخية مع إدخال وسائل الراحة الحديثة بسلاسة.",
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["بلاط يدوي", "خشب أرز", "زجاج معشق", "جبس مزخرف"],
    featured: false,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_SERVICES: Service[] = [
  { _id: "s1", title: "التصميم الداخلي", description: "حلول تصميم داخلي متكاملة من الفكرة إلى التنفيذ. نبتكر مساحات فريدة تعكس شخصيتك وأسلوب حياتك من خلال مواد وألوان وأثاث مختار بعناية.", icon: "interior", order: 1 },
  { _id: "s2", title: "التشطيبات", description: "خدمات تشطيب احترافية تحوّل التصاميم إلى واقع بدقة وجودة عالية. فريقنا ذو الخبرة يدير كل جانب من جوانب البناء لضمان تنفيذ مثالي لكل تفصيلة.", icon: "fitout", order: 2 },
  { _id: "s3", title: "الإشراف", description: "إشراف متخصص على المشاريع لضمان تنفيذ رؤيتك التصميمية بشكل مثالي. نتابع كل مرحلة من مراحل البناء مع الحفاظ على أعلى معايير الجودة والحرفية.", icon: "supervision", order: 3 },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { _id: "t1", clientName: "أحمد الراشد", quote: "آرت زون حولوا رؤيتنا إلى تحفة فنية حية. اهتمامهم بالتفاصيل وفهمهم للفخامة لا مثيل له.", avatar: null, projectTitle: "فيلا عصرية", projectSlug: "modern-villa-interior" },
  { _id: "t2", clientName: "سارة الموسى", quote: "العمل مع آرت زون كان تجربة رائعة. تجاوزوا توقعاتنا وابتكروا مساحة تعكس هوية علامتنا التجارية بشكل مثالي.", avatar: null, projectTitle: "مكتب فاخر", projectSlug: "luxury-office-space" },
  { _id: "t3", clientName: "خالد الفهد", quote: "الحرفية والإبداع الذي قدموه في تصميم مجلسنا كان استثنائياً. مزيج مثالي بين التقاليد والراحة العصرية.", avatar: null, projectTitle: "مجلس كلاسيكي", projectSlug: "classic-majlis-design" },
];

const DEFAULT_SETTINGS: SiteSettings = {
  logo: null,
  siteName: "ARTZONE",
  siteDescription: "نصنع تصاميم داخلية فاخرة تُلهم. من الفكرة إلى التنفيذ، نحوّل المساحات إلى أعمال فنية خالدة.",
  headerCtaText: "احصل على عرض سعر",
  headerCtaLink: "/contact",
  footerText: "نصنع تصاميم داخلية فاخرة تُلهم. من الفكرة إلى التنفيذ، نحوّل المساحات إلى أعمال فنية خالدة.",
  copyrightText: "آرت زون للتصميم. جميع الحقوق محفوظة.",
  whatsappNumber: "+201012345678",
  whatsappMessage: "مرحباً، أود الاستفسار عن خدمات التصميم الداخلي",
  whatsappEnabled: true,
  email: "info@artzonedesign.com",
  address: "مدينتي، القاهرة",
  addressNote: "بموعد مسبق فقط",
  instagramHandle: "@artzonedesign",
  workingHours: "الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً",
  closedDays: "الجمعة - السبت: مغلق",
  googleMapsUrl: "",
  googleMapsEnabled: true,
  contactPageTitle: "اتصل بنا",
  contactPageSubtitle: "يسعدنا سماع تفاصيل مشروعك. تواصل معنا ولنبتكر شيئاً استثنائياً معاً.",
  contactFormTitle: "طلب استشارة",
  contactFormSubtitle: "املأ النموذج أدناه وسيتواصل فريقنا معك خلال 24 ساعة.",
  contactPhonePlaceholder: "+20 1XX XXX XXXX",
  contactServiceOptions: ["تصميم داخلي", "تشطيبات", "إشراف", "استشارة", "أخرى"],
  contactBudgetRanges: [
    "أقل من 200,000 جنيه",
    "200,000 - 500,000 جنيه",
    "500,000 - 1,500,000 جنيه",
    "أكثر من 1,500,000 جنيه",
    "غير محدد بعد",
  ],
  contactWhatsappTitle: "واتساب",
  contactWhatsappCta: "تواصل معنا الآن",
  contactWhatsappHint: "رد سريع خلال ساعات العمل",
  contactEmailTitle: "البريد الإلكتروني",
  contactStudioTitle: "زوروا الاستوديو",
  contactHoursTitle: "ساعات العمل",
  fontScale: 100,
  heroLabel: "استوديو تصميم داخلي فاخر",
  heroTitle: "نصنع مساحات تُلهم الإبداع",
  heroSubtitle: "من الفكرة إلى التنفيذ، نحوّل المساحات العادية إلى تجارب استثنائية. كل تفصيلة مصممة بدقة وشغف وهدف.",
  heroCta1Text: "شاهد أعمالنا",
  heroCta1Link: "/portfolio",
  heroCta2Text: "احجز استشارة",
  heroCta2Link: "/contact",
  aboutLabel: "من نحن",
  aboutTitle: "نُعرّف الفخامة من خلال التصميم",
  aboutDescription: "في آرت زون للتصميم، نؤمن بأن المساحات الاستثنائية تروي قصة. فريقنا من المصممين المبدعين والحرفيين المهرة يعملون معاً لابتكار بيئات مذهلة وعملية في آنٍ واحد. بخبرة تزيد عن عقد من الزمن في التصميم الداخلي الفاخر، اكتسبنا ثقة العملاء المميزين في المنطقة.",
  projectsLabel: "أعمالنا",
  projectsTitle: "مشاريع مميزة",
  projectsDescription: "مجموعة مختارة من أبرز مشاريع التصميم الداخلي لدينا.",
  testimonialsLabel: "آراء العملاء",
  testimonialsTitle: "ماذا يقول عملاؤنا",
  ctaBannerTitle: "هل لديك مشروع في ذهنك؟",
  ctaBannerDescription: "دعنا نحول رؤيتك إلى واقع. تواصل معنا اليوم لبدء رحلة التصميم.",
  ctaBannerButtonText: "تواصل معنا عبر واتساب",
  sectionLabelSize: "sm",
  sectionTitleSize: "5xl",
  sectionBodySize: "lg",
  socialSectionEnabled: true,
  socialSectionLabel: "تابعنا",
  socialSectionTitle: "@artzonedesign",
  socialSectionDescription: "تابع رحلتنا على السوشيال ميديا لمشاهدة أحدث المشاريع والكواليس.",
  socialSectionImages: [],
  socialSectionButtonText: "تابعنا على انستغرام",
  socialSectionClickAction: "lightbox" as const,
  socialSectionCustomLink: "",
  socialLinks: {
    instagram: "https://instagram.com/artzonedesign",
    facebook: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    snapchat: "",
    linkedin: "",
  },
  socialLinksShow: {
    instagram: true,
    facebook: false,
    twitter: false,
    tiktok: false,
    youtube: false,
    snapchat: false,
    linkedin: false,
  },
  servicesPageLabel: "ماذا نقدم",
  servicesPageTitle: "خدماتنا",
  servicesPageDescription: "من الفكرة الأولى إلى التنفيذ النهائي، نقدم حلول تصميم شاملة مصممة خصيصاً لرؤيتك الفريدة.",
  servicesPageButtonText: "اطلب الخدمة",
  heroKeywordsEnabled: true,
  heroKeywords: ["تصميم داخلي", "فاخر", "إبداعي", "عصري", "أنيق", "مميّز", "احترافي", "راقي"],
  bentoBadgeText: "بخبرة تزيد عن عقد من الزمن",
  bentoFeatures: [
    { title: "استشارات التصميم", description: "نبدأ معك من الفكرة الأولى ونرسم خارطة طريق واضحة لمشروعك.", icon: "compass" },
    { title: "التصميم الداخلي", description: "تصاميم ثلاثية الأبعاد تجمع بين الجمال والوظيفة بدقة متناهية.", icon: "palette" },
    { title: "الإشراف والتنفيذ", description: "متابعة يومية لكل تفصيلة لضمان مطابقة النتائج لرؤيتك.", icon: "ruler" },
    { title: "تأثيث وتنسيق", description: "اختيار الأثاث والإكسسوارات التي تكمل هوية المكان بتناغم.", icon: "armchair" },
  ],
  bentoStats: [
    { value: "150+", label: "مشروع مكتمل" },
    { value: "12+", label: "سنوات خبرة" },
    { value: "98%", label: "رضا العملاء" },
  ],
  processLabel: "كيف نعمل",
  processTitle: "مراحل العمل",
  processDescription: "رحلة سلسة من فكرتك الأولى إلى مساحة متكاملة.",
  processSteps: [
    { step: "٠١", title: "الاستشارة", description: "نبدأ باستشارة معمّقة لفهم رؤيتك وأسلوب حياتك ومتطلباتك." },
    { step: "٠٢", title: "تطوير المفهوم", description: "يبتكر مصممونا مفهوماً شاملاً يتضمن لوحات الإلهام والتخطيطات واختيار المواد." },
    { step: "٠٣", title: "التصميم والتفاصيل", description: "يتم صقل كل عنصر بالرسومات الفنية والتصورات ثلاثية الأبعاد والمواصفات التفصيلية." },
    { step: "٠٤", title: "التنفيذ", description: "فريقنا يدير عملية البناء بالكامل، لضمان تنفيذ التصميم بأعلى المعايير." },
  ],
  colors: {
    offwhite: "#F5F0EB",
    charcoal: "#2C2C2C",
    warmgray: "#8A8078",
    gold: "#C9A96E",
    goldLight: "#D4BA8A",
    goldDark: "#B89555",
  },
  servicesColors: {
    heroBg: "#2C2C2C",
    heroText: "#FFFFFF",
    cardBg: "#FFFFFF",
    cardText: "#2C2C2C",
    processBg: "#FFFFFF",
  },
  projectCategories: [
    { value: "residential", label: "سكني" },
    { value: "commercial", label: "تجاري" },
    { value: "classic", label: "كلاسيكي" },
    { value: "modern", label: "عصري" },
  ],
  articleCategories: [
    { value: "design-tips", label: "نصائح التصميم" },
    { value: "trends", label: "اتجاهات التصميم" },
    { value: "inspiration", label: "إلهام" },
    { value: "guides", label: "أدلة ومراجع" },
  ],
  /* ── ZoomPortal ── */
  zoomPortalEnabled: true,
  zoomPortalScrollHeight: "500vh",
  zoomPortalBgColor: "#2C2C2C",
  zoomPortalVignetteOpacity: 0.72,
  zoomPortalGrainOpacity: 0.04,
  zoomPortalAccentColor: "#C9A96E",
  zoomPortalTopBadge: "بوابة التصميم",
  zoomPortalTopHint: "انزل لتدخل عالمنا",
  zoomPortalFinalTitle: "كل تفصيلة تحكي قصة",
  zoomPortalFinalTitleColor: "#ffffff",
  zoomPortalFinalSub: "من السفرة إلى الانتريه — نصمم مساحات تعيش فيها التفاصيل",
  zoomPortalFinalSubColor: "rgba(255,255,255,0.50)",
  zoomPortalCta1Text: "استكشف أعمالنا",
  zoomPortalCta1Link: "/portfolio",
  zoomPortalCta1Bg: "#C9A96E",
  zoomPortalCta1Color: "#ffffff",
  zoomPortalCta2Text: "تواصل معنا",
  zoomPortalCta2Link: "/contact",
  zoomPortalCta2Color: "rgba(255,255,255,0.70)",
  zoomPortalLayer1Src: "/portal-1-overview.jpg",
  zoomPortalLayer1Label: "زون آرت",
  zoomPortalLayer1ZoomOrigin: "50% 50%",
  zoomPortalLayer2Src: "/portal-2-dining.jpg",
  zoomPortalLayer2Label: "السفرة",
  zoomPortalLayer2ZoomOrigin: "50% 50%",
  zoomPortalLayer3Src: "/portal-3-living.jpg",
  zoomPortalLayer3Label: "الانتريه",
  zoomPortalLayer3ZoomOrigin: "50% 50%",
  homeBlogEnabled: true,
  homeBlogLabel: "المدونة",
  homeBlogTitle: "أحدث المقالات",
  homeBlogDescription: "نصائح واتجاهات في التصميم الداخلي من فريق آرت زون.",
  homeBlogLimit: 3,
  homeBlogCtaText: "عرض جميع المقالات",
};

// Projects
export function getProjects(): Project[] {
  return readJson("projects.json", DEFAULT_PROJECTS);
}
export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p._id === id);
}
export function getProjectBySlug(slug: string): Project | undefined {
  const decoded = decodeURIComponent(slug);
  return getProjects().find((p) => p.slug === decoded || p.slug === slug);
}
export function saveProject(project: Project): void {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p._id === project._id);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  writeJson("projects.json", projects);
}
export function deleteProject(id: string): void {
  writeJson("projects.json", getProjects().filter((p) => p._id !== id));
}

// Services
export function getServices(): Service[] {
  return readJson("services.json", DEFAULT_SERVICES);
}
export function getService(id: string): Service | undefined {
  return getServices().find((s) => s._id === id);
}
export function saveService(service: Service): void {
  const services = getServices();
  const idx = services.findIndex((s) => s._id === service._id);
  if (idx >= 0) services[idx] = service;
  else services.push(service);
  writeJson("services.json", services);
}
export function deleteService(id: string): void {
  writeJson("services.json", getServices().filter((s) => s._id !== id));
}

// Testimonials
export function getTestimonials(): Testimonial[] {
  return readJson("testimonials.json", DEFAULT_TESTIMONIALS);
}
export function getTestimonial(id: string): Testimonial | undefined {
  return getTestimonials().find((t) => t._id === id);
}
export function saveTestimonial(t: Testimonial): void {
  const items = getTestimonials();
  const idx = items.findIndex((x) => x._id === t._id);
  if (idx >= 0) items[idx] = t;
  else items.push(t);
  writeJson("testimonials.json", items);
}
export function deleteTestimonial(id: string): void {
  writeJson("testimonials.json", getTestimonials().filter((t) => t._id !== id));
}

// Messages
export function getMessages(): Message[] {
  return readJson<Message[]>("messages.json", []);
}
export function getMessage(id: string): Message | undefined {
  return getMessages().find((m) => m._id === id);
}
export function saveMessage(msg: Message): void {
  const messages = getMessages();
  const idx = messages.findIndex((m) => m._id === msg._id);
  if (idx >= 0) messages[idx] = msg;
  else messages.unshift(msg);
  writeJson("messages.json", messages);
}
export function deleteMessage(id: string): void {
  writeJson("messages.json", getMessages().filter((m) => m._id !== id));
}

// Articles
export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: string;
  published: boolean;
  /** يظهر في قسم المدونة بالصفحة الرئيسية (عند النشر) */
  showOnHome: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogImage: string | null;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_ARTICLES: Article[] = [
  {
    _id: "a1",
    title: "أحدث اتجاهات التصميم الداخلي لعام 2025",
    slug: "interior-design-trends-2025",
    excerpt: "اكتشف أبرز اتجاهات التصميم الداخلي التي تسيطر على عالم الديكور هذا العام، من الألوان الطبيعية إلى المواد المستدامة.",
    content: `<h2>الألوان الترابية تعود بقوة</h2>
<p>تشهد اتجاهات التصميم الداخلي لهذا العام عودة قوية للألوان الترابية والطبيعية. من درجات البيج الدافئ إلى الأخضر الزيتوني، تمنح هذه الألوان المساحات شعوراً بالهدوء والاتصال بالطبيعة.</p>

<h2>المواد الطبيعية والمستدامة</h2>
<p>يتزايد الطلب على المواد الطبيعية مثل الخشب والحجر والكتان في التصميم الداخلي. ليس فقط لجمالها، بل أيضاً لاستدامتها وتأثيرها الإيجابي على البيئة.</p>

<h2>البساطة الفاخرة</h2>
<p>مفهوم "الأقل هو الأكثر" يأخذ بعداً جديداً مع التركيز على قطع أثاث مختارة بعناية وعالية الجودة بدلاً من ملء المساحات بالعديد من القطع.</p>`,
    coverImage: null,
    category: "اتجاهات التصميم",
    tags: ["تصميم داخلي", "اتجاهات 2025", "ديكور"],
    author: "فريق آرت زون",
    published: true,
    showOnHome: false,
    seoTitle: "أحدث اتجاهات التصميم الداخلي لعام 2025 | آرت زون",
    seoDescription: "اكتشف أبرز اتجاهات التصميم الداخلي لعام 2025 من الألوان الطبيعية والمواد المستدامة إلى البساطة الفاخرة.",
    seoKeywords: ["اتجاهات التصميم الداخلي", "ديكور 2025", "تصميم داخلي حديث"],
    ogImage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "a2",
    title: "كيف تختار ألوان منزلك بشكل احترافي",
    slug: "how-to-choose-home-colors",
    excerpt: "دليل شامل لاختيار لوحة الألوان المثالية لمنزلك مع نصائح من خبراء التصميم الداخلي.",
    content: `<h2>فهم نظرية الألوان</h2>
<p>قبل اختيار ألوان منزلك، من المهم فهم أساسيات نظرية الألوان. الألوان الدافئة مثل الأحمر والبرتقالي تمنح الطاقة، بينما الألوان الباردة مثل الأزرق والأخضر تبعث على الهدوء.</p>

<h2>قاعدة 60-30-10</h2>
<p>من أشهر قواعد التصميم: استخدم لوناً رئيسياً بنسبة 60%، ولوناً ثانوياً بنسبة 30%، ولوناً مكملاً بنسبة 10% لخلق توازن بصري مريح.</p>

<h2>مراعاة الإضاءة الطبيعية</h2>
<p>تؤثر الإضاءة الطبيعية بشكل كبير على مظهر الألوان. اختبر الألوان في أوقات مختلفة من اليوم قبل اتخاذ قرارك النهائي.</p>`,
    coverImage: null,
    category: "نصائح التصميم",
    tags: ["ألوان", "نصائح", "تصميم داخلي"],
    author: "فريق آرت زون",
    published: true,
    showOnHome: false,
    seoTitle: "كيف تختار ألوان منزلك بشكل احترافي | آرت زون",
    seoDescription: "دليل شامل لاختيار لوحة الألوان المثالية لمنزلك مع نصائح عملية من خبراء التصميم الداخلي في آرت زون.",
    seoKeywords: ["اختيار ألوان المنزل", "ألوان الديكور", "نصائح تصميم"],
    ogImage: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function getArticles(): Article[] {
  const raw = readJson<Article[]>("articles.json", DEFAULT_ARTICLES);
  return raw.map((a) => ({
    ...a,
    showOnHome: a.showOnHome === true,
  }));
}
export function getPublishedArticles(): Article[] {
  return getArticles().filter((a) => a.published);
}

/** مقالات قسم المدونة في الصفحة الرئيسية: المقالات المفعّل لها «عرض في الرئيسية» أولاً، وإلا آخر المنشور */
export function getHomePageArticles(settings: SiteSettings): Article[] {
  const published = getPublishedArticles()
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const limit = Math.min(6, Math.max(1, Number(settings.homeBlogLimit) || 3));
  const onHome = published.filter((a) => a.showOnHome === true);
  if (onHome.length > 0) {
    return onHome.slice(0, limit);
  }
  return published.slice(0, limit);
}

export function getArticle(id: string): Article | undefined {
  return getArticles().find((a) => a._id === id);
}
export function getArticleBySlug(slug: string): Article | undefined {
  const decoded = decodeURIComponent(slug);
  return getArticles().find((a) => a.slug === decoded || a.slug === slug);
}
export function saveArticle(article: Article): void {
  const articles = getArticles();
  const idx = articles.findIndex((a) => a._id === article._id);
  if (idx >= 0) articles[idx] = article;
  else articles.unshift(article);
  writeJson("articles.json", articles);
}
export function deleteArticle(id: string): void {
  writeJson("articles.json", getArticles().filter((a) => a._id !== id));
}

// Settings
const OPTIONAL_EMPTY_FIELDS = new Set(["googleMapsUrl", "socialLinks", "socialLinksShow", "socialSectionImages", "socialSectionCustomLink", "processSteps", "colors", "servicesColors", "projectCategories", "articleCategories", "zoomPortalLayer1Src", "zoomPortalLayer2Src", "zoomPortalLayer3Src"]);

export function getSettings(): SiteSettings {
  const stored = readJson("settings.json", DEFAULT_SETTINGS);
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (OPTIONAL_EMPTY_FIELDS.has(key)) continue;
    const val = merged[key];
    const def = DEFAULT_SETTINGS[key];
    if (typeof def === "string" && def !== "" && val === "") {
      (merged as Record<string, unknown>)[key] = def;
    }
  }
  if (!Array.isArray(merged.contactServiceOptions) || merged.contactServiceOptions.length === 0) {
    merged.contactServiceOptions = [...DEFAULT_SETTINGS.contactServiceOptions];
  }
  if (!Array.isArray(merged.contactBudgetRanges) || merged.contactBudgetRanges.length === 0) {
    merged.contactBudgetRanges = [...DEFAULT_SETTINGS.contactBudgetRanges];
  }
  return merged;
}
export function saveSettings(settings: SiteSettings): void {
  writeJson("settings.json", settings);
}

export interface AdminUserRecord {
  _id: string;
  username: string;
  /** salt:hex from scrypt */
  passwordHash: string;
}

export function getAdminUserRecords(): AdminUserRecord[] {
  const raw = readJson<AdminUserRecord[]>("admins.json", []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r) =>
      r &&
      typeof r._id === "string" &&
      typeof r.username === "string" &&
      typeof r.passwordHash === "string"
  );
}

export function saveAdminUserRecords(users: AdminUserRecord[]): void {
  writeJson("admins.json", users);
}

/** سلايدر معرض الصور في الصفحة الرئيسية */
export type BrandSliderAnimation = "soft3d" | "fade" | "slide" | "zoom" | "blur";
export type BrandSliderParallax = "off" | "low" | "medium" | "high";
export type BrandSliderAspectPreset = "1/1" | "4/3" | "16/9" | "21/9" | "3/4";
export type BrandSliderSizePreset = "sm" | "md" | "lg" | "xl" | "full";

export interface BrandSliderSlide {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

export interface BrandSliderConfig {
  enabled: boolean;
  sectionEyebrow: string;
  sectionTitle: string;
  showSectionHeader: boolean;
  showTextOverlay: boolean;
  showCta: boolean;
  cta1Text: string;
  cta1Href: string;
  cta2Text: string;
  cta2Href: string;
  autoMs: number;
  animation: BrandSliderAnimation;
  parallax: BrandSliderParallax;
  aspectPreset: BrandSliderAspectPreset;
  sizePreset: BrandSliderSizePreset;
  slides: BrandSliderSlide[];
}

const DEFAULT_BRAND_SLIDER_SLIDES: BrandSliderSlide[] = [
  { id: "living-1", src: "/slider-showcase-1.png", title: "صالة معيشة فاخرة", subtitle: "توازن بين الكلاسيكية الخفيفة والإضاءة الدافئة" },
  { id: "dining-1", src: "/slider-showcase-2.png", title: "طاولة طعام أنيقة", subtitle: "خامات راقية وتفاصيل تشطيب مدروسة" },
  { id: "lounge", src: "/slider-showcase-3.png", title: "زاوية جلوس", subtitle: "لمسات خشب ونسيج بهدوء بصري" },
  { id: "dining-2", src: "/slider-showcase-4.png", title: "كلاسيكية معاصرة", subtitle: "جدران مزخرفة وإضاءة ناعمة" },
  { id: "open", src: "/slider-showcase-5.png", title: "مساحة مفتوحة", subtitle: "تدفق بين الطعام والمعيشة بانسجام" },
  { id: "tv", src: "/slider-showcase-6.png", title: "جدار تلفزيون", subtitle: "رخام وخشب وتكامل مع الإضاءة المخفية" },
];

const DEFAULT_BRAND_SLIDER: BrandSliderConfig = {
  enabled: true,
  sectionEyebrow: "ديكور · تشطيبات · تصميم داخلي",
  sectionTitle: "",
  showSectionHeader: true,
  showTextOverlay: true,
  showCta: true,
  cta1Text: "معرض الأعمال",
  cta1Href: "/portfolio",
  cta2Text: "استشارة تصميم",
  cta2Href: "/contact",
  autoMs: 6500,
  animation: "soft3d",
  parallax: "medium",
  aspectPreset: "1/1",
  sizePreset: "xl",
  slides: DEFAULT_BRAND_SLIDER_SLIDES,
};

function normalizeBrandSliderConfig(raw: unknown): BrandSliderConfig {
  const r = raw && typeof raw === "object" ? (raw as Partial<BrandSliderConfig>) : {};
  const anims: BrandSliderAnimation[] = ["soft3d", "fade", "slide", "zoom", "blur"];
  const parallaxes: BrandSliderParallax[] = ["off", "low", "medium", "high"];
  const aspects: BrandSliderAspectPreset[] = ["1/1", "4/3", "16/9", "21/9", "3/4"];
  const sizes: BrandSliderSizePreset[] = ["sm", "md", "lg", "xl", "full"];
  let slides: BrandSliderSlide[] = [];
  if (Array.isArray(r.slides)) {
    slides = (r.slides as BrandSliderSlide[]).filter(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.src === "string" &&
        s.src.trim() &&
        typeof s.title === "string" &&
        typeof s.subtitle === "string"
    );
  } else {
    slides = [...DEFAULT_BRAND_SLIDER_SLIDES];
  }
  return {
    ...DEFAULT_BRAND_SLIDER,
    ...r,
    enabled: r.enabled !== false,
    sectionEyebrow: typeof r.sectionEyebrow === "string" ? r.sectionEyebrow : DEFAULT_BRAND_SLIDER.sectionEyebrow,
    sectionTitle: typeof r.sectionTitle === "string" ? r.sectionTitle : DEFAULT_BRAND_SLIDER.sectionTitle,
    showSectionHeader: r.showSectionHeader !== false,
    showTextOverlay: r.showTextOverlay !== false,
    showCta: r.showCta !== false,
    cta1Text: typeof r.cta1Text === "string" ? r.cta1Text : DEFAULT_BRAND_SLIDER.cta1Text,
    cta1Href: typeof r.cta1Href === "string" ? r.cta1Href : DEFAULT_BRAND_SLIDER.cta1Href,
    cta2Text: typeof r.cta2Text === "string" ? r.cta2Text : DEFAULT_BRAND_SLIDER.cta2Text,
    cta2Href: typeof r.cta2Href === "string" ? r.cta2Href : DEFAULT_BRAND_SLIDER.cta2Href,
    autoMs: typeof r.autoMs === "number" && r.autoMs >= 2000 && r.autoMs <= 60000 ? r.autoMs : DEFAULT_BRAND_SLIDER.autoMs,
    animation: anims.includes(r.animation as BrandSliderAnimation) ? (r.animation as BrandSliderAnimation) : "soft3d",
    parallax: parallaxes.includes(r.parallax as BrandSliderParallax) ? (r.parallax as BrandSliderParallax) : "medium",
    aspectPreset: aspects.includes(r.aspectPreset as BrandSliderAspectPreset) ? (r.aspectPreset as BrandSliderAspectPreset) : "1/1",
    sizePreset: sizes.includes(r.sizePreset as BrandSliderSizePreset) ? (r.sizePreset as BrandSliderSizePreset) : "xl",
    slides,
  };
}

export function getBrandSliderConfig(): BrandSliderConfig {
  const stored = readJson<unknown>("brand-slider.json", {});
  return normalizeBrandSliderConfig(stored);
}

export function saveBrandSliderConfig(config: BrandSliderConfig): void {
  writeJson("brand-slider.json", normalizeBrandSliderConfig(config));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
