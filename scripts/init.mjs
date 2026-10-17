// Turns the template into a new server, once, right after "Use this template": its name everywhere
// (package, command, repository, site) and its one-line description.
//   npm run init -- <name> "<description>"      e.g. npm run init -- docker-lab-mcp "Hands-on practices in Docker, safe by default."
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [name, description] = process.argv.slice(2);
if (!name || !/^[a-z][a-z0-9-]*$/.test(name) || !description) {
  console.error('Usage: npm run init -- <name> "<description>"   (name in kebab-case, e.g. docker-lab-mcp)');
  process.exit(2);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OLD = "mcp-server-template";
const OLD_DESCRIPTION = "A Falken's Lab MCP server.";
const skip = new Set(["node_modules", ".git", "dist", "build", ".docusaurus"]);

let changed = 0;
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (skip.has(entry)) continue;
    const file = path.join(dir, entry);
    if (statSync(file).isDirectory()) walk(file);
    else if (/\.(json|md|mdx|ts|tsx|mjs|js|yml|yaml|css|svg)$/.test(entry)) {
      const text = readFileSync(file, "utf8");
      const next = text.split(OLD_DESCRIPTION).join(description).split(OLD).join(name);
      if (next !== text) {
        writeFileSync(file, next);
        changed++;
      }
    }
  }
};
walk(root);
// The template is private so it can't be published by mistake; the new server is meant to be published.
const manifest = path.join(root, "package.json");
writeFileSync(manifest, readFileSync(manifest, "utf8").replace(/\n {2}"private": true,/, ""));
console.log(`${changed} files now say ${name}. Next: npm install, then read CLAUDE.md, and remove scripts/init.mjs and the "init" script.`);
