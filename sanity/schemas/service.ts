interface SanityRule {
  required: () => SanityRule;
}

const service = {
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule: SanityRule) => Rule.required(),
    },
    {
      name: "icon",
      title: "Icon Name",
      type: "string",
      description: "Icon identifier (e.g. 'interior', 'fitout', 'supervision')",
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
    },
  ],
};

export default service;
