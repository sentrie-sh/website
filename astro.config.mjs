// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { sentrieGrammar } from "./src/sentrie-grammar.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://sentrie.sh",
  trailingSlash: "ignore",
  integrations: [
    starlight({
      title: "Sentrie",
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
            {
              label: "What is Sentrie?",
              slug: "getting-started/what-is-sentrie",
            },
            {
              label: "What is Policy as Code?",
              slug: "getting-started/what-is-policy-as-code",
            },
            {
              label: "Why Sentrie?",
              slug: "getting-started/why-sentrie",
            },
            {
              label: "Installation",
              slug: "getting-started/installation",
            },
            {
              label: "Writing your first Policy",
              slug: "getting-started/writing-your-first-policy",
            },
            {
              label: "Running your Policy",
              slug: "getting-started/running-your-policy",
            },
          ],
        },
        {
          label: "Structure of a Policy Pack",
          items: [
            {
              label: "Overview",
              slug: "structure-of-a-policy-pack/overview",
            },
            {
              label: "Pack File",
              slug: "structure-of-a-policy-pack/packfile",
            },
            {
              label: "Program File",
              slug: "structure-of-a-policy-pack/program-file",
            },
            {
              label: "TypeScript File",
              slug: "structure-of-a-policy-pack/typescript-file",
            },
            {
              label: "Example Pack",
              slug: "structure-of-a-policy-pack/example-pack",
            },
          ],
        },
        {
          label: "Running Sentrie",
          items: [
            {
              label: "Executing Policies",
              slug: "running-sentrie/executing-policies",
            },
            {
              label: "Serving Policies",
              slug: "running-sentrie/serving-policies",
            },
            {
              label: "OTEL Integration",
              slug: "running-sentrie/otel-integration",
            },
          ],
        },
        {
          label: "Reference",
          items: [
            {
              label: "Overview",
              slug: "reference",
            },
            {
              label: "Types and Values",
              slug: "reference/types-and-values",
            },
            {
              label: "Constraints",
              slug: "reference/constraints",
            },
            {
              label: "Trinary Values",
              slug: "reference/trinary",
            },
            {
              label: "Shapes",
              slug: "reference/shapes",
            },
            {
              label: "Namespaces",
              slug: "reference/namespaces",
            },
            {
              label: "Policies",
              slug: "reference/policies",
            },
            {
              label: "Facts",
              slug: "reference/facts",
            },
            {
              label: "Rules",
              slug: "reference/rules",
            },
            {
              label: "Intermediate Values",
              slug: "reference/let",
            },
            {
              label: "Arithmetic Operations",
              slug: "reference/arithmetic-operations",
            },
            {
              label: "Boolean Operations",
              slug: "reference/boolean-operations",
            },
            {
              label: "Collection Operations",
              slug: "reference/collection-operations",
            },
            {
              label: "Using Functions",
              slug: "reference/functions",
            },
            {
              label: "Using TypeScript",
              slug: "reference/using-typescript",
            },
            {
              label: "Precedence",
              slug: "reference/precedence",
            },
            {
              label: "Security and Permissions",
              slug: "reference/security-and-permissions",
            },
          ],
        },
        {
          label: "TypeScript Modules",
          items: [
            {
              label: "Overview",
              slug: "reference/typescript_modules",
            },
            {
              label: "JavaScript Globals",
              slug: "reference/typescript_modules/sentrie/js",
            },
            {
              label: "Collection",
              slug: "reference/typescript_modules/sentrie/collection",
            },
            {
              label: "Crypto",
              slug: "reference/typescript_modules/sentrie/crypto",
            },
            {
              label: "Encoding",
              slug: "reference/typescript_modules/sentrie/encoding",
            },
            {
              label: "Hash",
              slug: "reference/typescript_modules/sentrie/hash",
            },
            {
              label: "JSON",
              slug: "reference/typescript_modules/sentrie/json",
            },
            {
              label: "JWT",
              slug: "reference/typescript_modules/sentrie/jwt",
            },
            {
              label: "Net",
              slug: "reference/typescript_modules/sentrie/net",
            },
            {
              label: "Regex",
              slug: "reference/typescript_modules/sentrie/regex",
            },
            {
              label: "Semver",
              slug: "reference/typescript_modules/sentrie/semver",
            },
            {
              label: "Time",
              slug: "reference/typescript_modules/sentrie/time",
            },
            {
              label: "URL",
              slug: "reference/typescript_modules/sentrie/url",
            },
            {
              label: "UUID",
              slug: "reference/typescript_modules/sentrie/uuid",
            },
          ],
        },
        {
          label: "CLI Reference",
          items: [
            {
              label: "Overview",
              slug: "cli-reference",
            },
            {
              label: "init",
              slug: "cli-reference/init",
            },
            {
              label: "exec",
              slug: "cli-reference/exec",
            },
            {
              label: "serve",
              slug: "cli-reference/serve",
            },
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
