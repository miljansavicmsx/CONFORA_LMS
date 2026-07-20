/**
 * ISO §7.4 — block inline <script> in JSX without a nonce (nonce CSP regression gate).
 * @type {import('eslint').Rule.RuleModule}
 */
export const noInlineScriptWithoutNonce = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow inline <script> elements without a nonce attribute (Content-Security-Policy strict-dynamic).',
    },
    schema: [],
    messages: {
      missingNonce:
        'Inline <script> must include a nonce attribute (or load an external script file). See docs/security/csp-vs-a11y.md.',
      forbiddenInline:
        'Inline <script> children are not allowed; use external scripts with nonce CSP.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name;
        if (name.type !== 'JSXIdentifier' || name.name !== 'script') {
          return;
        }
        const hasNonce = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name.type === 'JSXIdentifier' &&
            attr.name.name === 'nonce' &&
            attr.value != null,
        );
        if (!hasNonce) {
          context.report({ node, messageId: 'missingNonce' });
        }
      },
      JSXElement(node) {
        const open = node.openingElement;
        const name = open.name;
        if (name.type !== 'JSXIdentifier' || name.name !== 'script') {
          return;
        }
        const hasChildren = node.children.some(
          (c) => c.type !== 'JSXText' || String(c.value).trim().length > 0,
        );
        if (hasChildren) {
          context.report({ node, messageId: 'forbiddenInline' });
        }
      },
    };
  },
};
