const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const output = path.join(root, "dist");
const files = ["index.html", "styles.css", "app.js"];
const directories = ["data", "imgs", "svgs"];

async function build() {
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });

  for (const file of files) {
    await fs.copyFile(path.join(root, file), path.join(output, file));
  }

  for (const directory of directories) {
    await fs.cp(path.join(root, directory), path.join(output, directory), { recursive: true });
  }

  console.log("Static site built in dist/.");
}

build().catch((error) => {
  console.error("Failed to build the static site.", error);
  process.exitCode = 1;
});
