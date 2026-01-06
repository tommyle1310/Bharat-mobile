const fs = require("fs-extra");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, ".."); // Bharat-mobile/
const SRC_DIR = path.join(PROJECT_ROOT, "assets/data-files");
const DEST_DIR = path.join(PROJECT_ROOT, "assets/data-files");

async function syncDataFiles() {
  try {
    await fs.ensureDir(DEST_DIR);
    // Since source and destination are the same, just ensure the directory exists
    console.log(`✅ Data files directory verified: ${DEST_DIR}`);
  } catch (err) {
    console.error("❌ Sync error:", err);
    process.exit(1);
  }
}

syncDataFiles();
