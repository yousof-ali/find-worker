import fs from "fs/promises";
import path from "path";
 
const ROOT = path.join(process.cwd(), "public", "uploads");
 
export const hasUpload = (f) =>
  f && typeof f === "object" && typeof f.arrayBuffer === "function" && f.size > 0;
 
// folder e.g. "workers", "work-samples"  ->  returns "/uploads/<folder>/<file>"
export async function saveFile(file, folder) {
  const dir = path.join(ROOT, folder);
  await fs.mkdir(dir, { recursive: true });
  let ext = path.extname(file.name || "").toLowerCase();
  if (!/^\.[a-z0-9]{1,5}$/.test(ext)) ext = "";
  const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${name}`;
}
 
export async function removeFile(publicPath) {
  if (!publicPath) return;
  await fs.unlink(path.join(process.cwd(), "public", publicPath)).catch(() => {});
}