import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "target/wasm32-unknown-unknown/release");
const budget = Number(process.env.WASM_SIZE_BUDGET_BYTES ?? 1024 * 1024);
const files = (await readdir(root).catch(() => [])).filter((name) => name.endsWith(".wasm"));

if (files.length === 0) {
  console.error(`No release WASM files found in ${root}`);
  process.exit(1);
}

let failed = false;
const rows = ["| Contract | Size | Budget | Status |", "| --- | ---: | ---: | --- |"];
for (const file of files.sort()) {
  const size = (await stat(path.join(root, file))).size;
  const status = size > budget ? "FAIL" : "OK";
  if (status === "FAIL") failed = true;
  rows.push(`| ${file} | ${size.toLocaleString()} bytes | ${budget.toLocaleString()} bytes | ${status} |`);
}
console.log(rows.join("\n"));
if (failed) process.exit(1);
