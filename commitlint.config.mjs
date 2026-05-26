/**
 * Conventional Commits — https://www.conventionalcommits.org
 *
 * Examples that pass:
 *   feat: add cover letter preview
 *   fix(form): reset state after submit
 *   refactor!: drop legacy storage
 *
 * Examples that fail:
 *   updated stuff      // missing type
 *   FIX: broken nav    // type must be lowercase
 */
const config = {
  extends: ["@commitlint/config-conventional"],
};

export default config;
