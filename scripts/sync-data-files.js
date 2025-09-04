const fs = require("fs-extra");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "../.."); // lên kmsg/
const SRC_DIR = path.join(PROJECT_ROOT, "data-files");
const DEST_DIR = path.join(PROJECT_ROOT, "mobile/assets/data-files");

async function syncDataFiles() {
  try {
    await fs.ensureDir(DEST_DIR);
    await fs.emptyDir(DEST_DIR); // clear old
    await fs.copy(SRC_DIR, DEST_DIR);
    console.log(`✅ Synced data-files -> ${DEST_DIR}`);
  } catch (err) {
    console.error("❌ Sync error:", err);
    process.exit(1);
  }
}

syncDataFiles();
