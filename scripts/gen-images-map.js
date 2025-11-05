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
    const parts = f.split("/"); // ["vehicle_types", "2W.png"] or ["vehicles", "1", "2.jpg"]
    const filename = path.basename(f, path.extname(f));
  
    let key;
  
    if (parts[0] === "vehicles" && parts.length === 3) {
      key = `vehicle-${parts[1]}-${filename}`; // vehicle-1-2, vehicle-2-3, etc.
    } else if (parts[0] === "buyer" && parts.length === 3) {
      key = `buyer-${parts[1]}-${filename}`; // buyer-1-1
    } else if (parts[0] === "vehicle_types") {
      key = `vehicletype-${filename.toLowerCase().replace(/\s+/g, "")}`; // vehicletype-2w, vehicletype-constructionequipment
    } else {
      // For case_option, region, etc. use just the filename
      key = filename.toLowerCase(); 
    }
  
    out += `  "${key}": require("../assets/data-files/${f}"),\n`;
  });
  
  

out += "};\n";

fs.writeFileSync(OUTPUT_FILE, out);
console.log(`✅ Generated ${OUTPUT_FILE} with ${files.length} images`);
