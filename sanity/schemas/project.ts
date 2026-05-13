interface SanityRule {
  required: () => SanityRule;
}

const project = {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Residential", value: "residential" },
          { title: "Commercial", value: "commercial" },
          { title: "Classic", value: "classic" },
          { title: "Modern", value: "modern" },
        ],
      },
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "concept",
      title: "Concept",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    },
    {
      name: "beforeImage",
      title: "Before Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "afterImage",
      title: "After Image",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "materials",
      title: "Materials Used",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    },
    {
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
    },
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
};

export default project;
