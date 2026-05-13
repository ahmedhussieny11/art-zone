export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
}

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  coverImage: SanityImage | null;
  concept?: Array<{
    _type: string;
    children: Array<{ _type: string; text: string }>;
  }>;
  gallery?: SanityImage[];
  beforeImage?: SanityImage | null;
  afterImage?: SanityImage | null;
  materials?: string[];
  featured?: boolean;
}

export interface Testimonial {
  _id: string;
  clientName: string;
  quote: string;
  avatar: SanityImage | null;
  project?: { title: string; slug: { current: string } };
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order?: number;
}
