// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { sentrieGrammar } from "./src/sentrie-grammar.ts";

// https://astro.build/config
export default defineConfig({
  site: process.env.ASTRO_SITE_URL || "https://sentrie.sh",
  trailingSlash: "ignore",
  prefetch: {
    defaultStrategy: "viewport",
    prefetchAll: true,
  },
  integrations: [
    starlight({
      title: "Sentrie",
      credits: true,
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/sentrie-sh/sentrie",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction & Core Philosophy", slug: "getting-started/introduction" },
            { label: "Quick Start", slug: "getting-started/quick-start" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Writing your first Policy", slug: "getting-started/writing-your-first-policy" },
            { label: "Running your Policy", slug: "getting-started/running-your-policy" },
            { label: "Enforcement", slug: "getting-started/enforcement" },
          ],
        },
        {
          label: "Language Concepts",
          items: [
            { label: "Type System & Shapes Overview", slug: "language-concepts/type-system-shapes" },
            { label: "Policy Composition", slug: "language-concepts/policy-composition" },
            { label: "Pattern Matching & Conditionals", slug: "language-concepts/pattern-matching-conditionals" },
          ],
        },
        {
          label: "Language Reference",
          items: [
            { label: "Overview", slug: "reference" },
            { label: "Namespaces", slug: "reference/namespaces" },
            { label: "Policies", slug: "reference/policies" },
            { label: "Rules", slug: "reference/rules" },
            { label: "Facts", slug: "reference/facts" },
            { label: "Intermediate Values (let)", slug: "reference/let" },
            { label: "Types and Values", slug: "reference/types-and-values" },
            { label: "Constraints", slug: "reference/constraints" },
            { label: "Trinary Values", slug: "reference/trinary" },
            { label: "Shapes", slug: "reference/shapes" },
            { label: "Arithmetic Operations", slug: "reference/arithmetic-operations" },
            { label: "Boolean Operations", slug: "reference/boolean-operations" },
            { label: "Membership Operations", slug: "reference/membership-operations" },
            { label: "Collection Operations", slug: "reference/collection-operations" },
            { label: "Functions", slug: "reference/functions" },
            { label: "Precedence", slug: "reference/precedence" },
            { label: "Security and Permissions", slug: "reference/security-and-permissions" },
          ],
        },
        {
          label: "TypeScript Modules",
          items: [
            { label: "Overview", slug: "reference/typescript_modules" },
            { label: "JavaScript Globals", slug: "reference/typescript_modules/sentrie/js" },
            { label: "Collection", slug: "reference/typescript_modules/sentrie/collection" },
            { label: "Crypto", slug: "reference/typescript_modules/sentrie/crypto" },
            { label: "Encoding", slug: "reference/typescript_modules/sentrie/encoding" },
            { label: "Hash", slug: "reference/typescript_modules/sentrie/hash" },
            { label: "JSON", slug: "reference/typescript_modules/sentrie/json" },
            { label: "JWT", slug: "reference/typescript_modules/sentrie/jwt" },
            { label: "Net", slug: "reference/typescript_modules/sentrie/net" },
            { label: "Regex", slug: "reference/typescript_modules/sentrie/regex" },
            { label: "Semver", slug: "reference/typescript_modules/sentrie/semver" },
            { label: "Time", slug: "reference/typescript_modules/sentrie/time" },
            { label: "URL", slug: "reference/typescript_modules/sentrie/url" },
            { label: "UUID", slug: "reference/typescript_modules/sentrie/uuid" },
          ],
        },
        {
          label: "Extensibility",
          items: [
            { label: "Writing Custom TypeScript Modules", slug: "extensibility/writing-custom-typescript-modules" },
          ],
        },
        {
          label: "CLI Reference",
          items: [
            { label: "Overview", slug: "cli-reference" },
            { label: "sentrie exec", slug: "cli-reference/exec" },
            { label: "sentrie init", slug: "cli-reference/init" },
            { label: "sentrie serve", slug: "cli-reference/serve" },
            { label: "sentrie validate", slug: "cli-reference/validate" },
          ],
        },
        {
          label: "Deployment & Operations",
          items: [
            { label: "Running as a Service", slug: "deployment-operations/running-as-service" },
          ],
        },
      ],
      expressiveCode: {
        themes: ["github-dark", "github-light"],
        shiki: {
          langs: [sentrieGrammar],
        },
      },
    }),
  ],
});
