const fs = require("fs");
const process = require("process");
const child = require("child_process");

console.log("> Bundling package...");
child.execSync("npx webpack");
child.execSync("npx tsc index.ts types.ts --outDir dist --declaration");

console.log("> Copying README.md to dist directory...");
fs.copyFileSync("./README.md", "./dist/README.md");

console.log("> Generating package.json in dist directory...");
const packageJson = JSON.parse(fs.readFileSync("package.json"));
delete packageJson.private;
delete packageJson.files;
delete packageJson.prepublish;
delete packageJson.scripts;
delete packageJson.dependencies;
delete packageJson.devDependencies;
packageJson.main = "index.js";

fs.writeFileSync("dist/package.json", JSON.stringify(packageJson, null, 2));

console.log("> Build completed successfully!");
