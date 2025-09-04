const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "../assets/data-files");
const OUTPUT_FILE = path.resolve(__dirname, "../src/images.ts");

function walkDir(dir, filelist = [], basedir = DATA_DIR) {
  fs.readdirSync(dir).forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      filelist = walkDir(filepath, filelist, basedir);
    } else {
      const relPath = path.relative(basedir, filepath).replace(/\\/g, "/");
      filelist.push(relPath);
    }
  });
  return filelist;
}

const files = walkDir(DATA_DIR);
let out = `// AUTO-GENERATED, DO NOT EDIT\n\nexport const images: Record<string, any> = {\n`;

files.forEach(f => {
    const parts = f.split("/"); // ["vehicle", "1", "1.jpg"]
    const filename = path.basename(f, path.extname(f)).toLowerCase();
  
    let key;
  
    if (parts[0] === "vehicle" || parts[0] === "buyer") {
      key = `${parts[0]}-${parts[1]}-${filename}`; // vehicle-1-1
    } else {
      key = filename; // case_option, region, ...
    }
  
    out += `  "${key}": require("../assets/data-files/${f}"),\n`;
  });
  
  

out += "};\n";

fs.writeFileSync(OUTPUT_FILE, out);
console.log(`✅ Generated ${OUTPUT_FILE} with ${files.length} images`);
