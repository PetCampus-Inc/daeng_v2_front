/** LHCI가 남긴 HTML 리포트 삭제 (JSON만 유지) */
const fs = require('fs');
const path = require('path');

function removeHtmlIn(dir) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.html')) continue;
    fs.unlinkSync(path.join(dir, name));
    removed += 1;
  }
  return removed;
}

const removed =
  removeHtmlIn(path.join(process.cwd(), 'lighthouse-results')) +
  removeHtmlIn(path.join(process.cwd(), '.lighthouseci'));

if (removed > 0) {
  console.log(`Removed ${removed} HTML report file(s)`);
}
