const fs = require('fs');
const path = require('path');

// Mock printer service: save HTML to a file in tmp/ and return path (in real deploy, integrate with actual printer)
const TMP_DIR = path.join(__dirname, '..', '..', 'tmp_prints');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

async function printHtml(html, opts = {}){
  const ts = Date.now();
  const filename = `invoice_${ts}.html`;
  const filepath = path.join(TMP_DIR, filename);
  await fs.promises.writeFile(filepath, html, 'utf8');
  // public URL served by app at /print_files/<filename>
  const publicUrl = `/print_files/${encodeURIComponent(filename)}`;
  return { saved: true, path: filepath, publicUrl };
}

module.exports = { printHtml };
