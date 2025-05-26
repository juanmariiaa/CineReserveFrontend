const fs = require("fs");
const path = require("path");

function separarComponentes(inputFile) {
  const fileContent = fs.readFileSync(inputFile, "utf-8");

  const templateMatch = fileContent.match(/template\s*:\s*`([\s\S]*?)`/);
  const stylesMatch = fileContent.match(/styles\s*:\s*\[\s*`([\s\S]*?)`\s*\]/);

  if (!templateMatch && !stylesMatch) {
    console.log(`No inline template ni styles en ${inputFile}, se salta.`);
    return;
  }

  const templateContent = templateMatch ? templateMatch[1].trim() : "";
  const stylesContent = stylesMatch ? stylesMatch[1].trim() : "";

  const dir = path.dirname(inputFile);
  const baseName = path.basename(inputFile, ".ts");

  const htmlFile = path.join(dir, `${baseName}.html`);
  const scssFile = path.join(dir, `${baseName}.scss`);

  if (templateContent) {
    fs.writeFileSync(htmlFile, templateContent);
    console.log(`Archivo creado: ${htmlFile}`);
  }

  if (stylesContent) {
    fs.writeFileSync(scssFile, stylesContent);
    console.log(`Archivo creado: ${scssFile}`);
  }

  let newTsContent = fileContent;

  if (templateContent) {
    newTsContent = newTsContent.replace(
      /template\s*:\s*`[\s\S]*?`,?/,
      `templateUrl: './${baseName}.html',`
    );
  }

  if (stylesContent) {
    newTsContent = newTsContent.replace(
      /styles\s*:\s*\[\s*`[\s\S]*?`\s*\],?/,
      `styleUrls: ['./${baseName}.scss'],`
    );
  }

  fs.writeFileSync(inputFile, newTsContent);
  console.log(`Archivo modificado: ${inputFile}`);
}

function procesarCarpetaRecursiva(carpeta) {
  const archivos = fs.readdirSync(carpeta);

  archivos.forEach((archivo) => {
    const fullPath = path.join(carpeta, archivo);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      procesarCarpetaRecursiva(fullPath);
    } else if (
      stats.isFile() &&
      archivo.endsWith("component.ts") // <-- solo archivos que terminen en component.ts
    ) {
      separarComponentes(fullPath);
    }
  });
}

const carpetaComponentes = "./src/app";

procesarCarpetaRecursiva(carpetaComponentes);
