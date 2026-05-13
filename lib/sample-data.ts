export const sampleProjects = [
  {
    _id: "1",
    title: "فيلا عصرية",
    slug: { current: "modern-villa-interior" },
    category: "residential",
    coverImage: null,
    concept: [{ _type: "block" as const, children: [{ _type: "span" as const, text: "مشروع سكني معاصر يمزج بين الجماليات البسيطة والمواد الطبيعية الدافئة." }] }],
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["رخام إيطالي", "خشب بلوط", "نحاس مصقول", "كتان"],
    featured: true,
  },
  {
    _id: "2",
    title: "مكتب فاخر",
    slug: { current: "luxury-office-space" },
    category: "commercial",
    coverImage: null,
    concept: [{ _type: "block" as const, children: [{ _type: "span" as const, text: "بيئة مكتبية تنفيذية مصممة لإلهام الإنتاجية مع الحفاظ على أجواء الأناقة الراقية." }] }],
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["قشرة جوز", "زجاج مدخن", "جلد", "نحاس"],
    featured: true,
  },
  {
    _id: "3",
    title: "مجلس كلاسيكي",
    slug: { current: "classic-majlis-design" },
    category: "classic",
    coverImage: null,
    concept: [{ _type: "block" as const, children: [{ _type: "span" as const, text: "مجلس تقليدي أُعيد تصوره بحرفية كلاسيكية وأقمشة فاخرة." }] }],
    gallery: [],
    beforeImage: null,
    afterImage: null,
    materials: ["قماش حريري", "ذهب عيار", "كريستال", "خشب منحوت"],
    featured: true,
  },
];

export const sampleTestimonials = [
  { _id: "t1", clientName: "أحمد الراشد", quote: "آرت زون حولوا رؤيتنا إلى تحفة فنية حية. اهتمامهم بالتفاصيل وفهمهم للفخامة لا مثيل له.", avatar: null, project: { title: "فيلا عصرية", slug: { current: "modern-villa-interior" } } },
  { _id: "t2", clientName: "سارة الموسى", quote: "العمل مع آرت زون كان تجربة رائعة. تجاوزوا توقعاتنا وابتكروا مساحة تعكس هوية علامتنا التجارية بشكل مثالي.", avatar: null, project: { title: "مكتب فاخر", slug: { current: "luxury-office-space" } } },
  { _id: "t3", clientName: "خالد الفهد", quote: "الحرفية والإبداع الذي قدموه في تصميم مجلسنا كان استثنائياً. مزيج مثالي بين التقاليد والراحة العصرية.", avatar: null, project: { title: "مجلس كلاسيكي", slug: { current: "classic-majlis-design" } } },
];

export const sampleServices = [
  { _id: "s1", title: "التصميم الداخلي", description: "حلول تصميم داخلي متكاملة من الفكرة إلى التنفيذ. نبتكر مساحات فريدة تعكس شخصيتك وأسلوب حياتك من خلال مواد وألوان وأثاث مختار بعناية.", icon: "interior", order: 1 },
  { _id: "s2", title: "التشطيبات", description: "خدمات تشطيب احترافية تحوّل التصاميم إلى واقع بدقة وجودة عالية. فريقنا ذو الخبرة يدير كل جانب من جوانب البناء لضمان تنفيذ مثالي لكل تفصيلة.", icon: "fitout", order: 2 },
  { _id: "s3", title: "الإشراف", description: "إشراف متخصص على المشاريع لضمان تنفيذ رؤيتك التصميمية بشكل مثالي. نتابع كل مرحلة من مراحل البناء مع الحفاظ على أعلى معايير الجودة والحرفية.", icon: "supervision", order: 3 },
];
