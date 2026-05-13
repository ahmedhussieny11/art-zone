interface SanityRule {
  required: () => SanityRule;
}

const testimonial = {
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    {
      name: "clientName",
      title: "Client Name",
      type: "string",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "quote",
      title: "Quote",
      type: "text",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "project",
      title: "Related Project",
      type: "reference",
      to: [{ type: "project" }],
    },
    {
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    },
  ],
};

export default testimonial;
