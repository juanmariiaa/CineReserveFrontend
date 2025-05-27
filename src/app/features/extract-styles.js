const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

function extractStyles(filePath) {
  if (!filePath.endsWith(".component.ts")) return;

  let content = fs.readFileSync(filePath, "utf8");

  // Regex para encontrar `styles: [ ... ]`
  const stylesRegex = /styles\s*:\s*\[((?:.|\n)*?)\],?/m;

  const match = content.match(stylesRegex);
  if (!match) return;

  const stylesArray = match[1];

  // Limpiar comillas y líneas
  let styles = stylesArray
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^['"`]|['"`]$/g, "")) // quitar comillas
    .join("\n");

  // Escribir archivo SCSS
  const scssFile = filePath.replace(".component.ts", ".component.scss");
  fs.writeFileSync(scssFile, styles, "utf8");
  console.log(`✅ Estilos extraídos a: ${scssFile}`);

  // Reemplazar styles con styleUrls
  const componentDir = "./" + path.basename(scssFile);
  const updatedContent = content.replace(
    stylesRegex,
    `styleUrls: ['${componentDir}'],`
  );

  fs.writeFileSync(filePath, updatedContent, "utf8");
  console.log(`✏️  Actualizado: ${filePath}`);
}

// Ejecutar en el directorio actual y subcarpetas
const rootDir = process.cwd();
walkDir(rootDir, extractStyles);
