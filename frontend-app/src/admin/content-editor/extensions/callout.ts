import { mergeAttributes, Node } from "@tiptap/core";

export type CalloutVariant = "info" | "warning" | "important" | "example";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      insertCallout: (variant?: CalloutVariant) => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "paragraph+",
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: "info" satisfies CalloutVariant,
        parseHTML: (el) => (el.getAttribute("data-variant") as CalloutVariant) ?? "info",
        renderHTML: (attrs) => ({
          "data-variant": attrs.variant,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-callout]",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const variant = (node.attrs.variant as CalloutVariant) ?? "info";
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-callout": "",
        class: `cf-admin-callout cf-admin-callout-${variant}`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      insertCallout:
        (variant: CalloutVariant = "info") =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { variant },
            content: [{ type: "paragraph" }],
          }),
    };
  },
});
