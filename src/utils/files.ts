export function getImageExtensions() {
  return ["jpg", "jpeg", "png", "gif", "webp"];
}

export function validateImages(files: File[], opts = { maxFiles: 5, maxMB: 50 }) {
  const errors: string[] = [];
  const { maxFiles, maxMB } = opts;
  if (files.length > maxFiles) {
    errors.push(`Selecione no máximo ${maxFiles} imagens.`);
  }
  const allowed = new Set(getImageExtensions());
  const maxBytes = maxMB * 1024 * 1024;
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowed.has(ext)) {
      errors.push(`Arquivo inválido: ${f.name}`);
    }
    if (f.size > maxBytes) {
      errors.push(`Arquivo muito grande: ${f.name} (> ${maxMB}MB)`);
    }
  }
  return { isValid: errors.length === 0, errors };
}
