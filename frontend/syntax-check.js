const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const checkFile = (file) => {
  try {
    cp.execSync(`node --check "${file}"`, { stdio: 'pipe' });
  } catch (e) {
    console.log(file + ' has syntax error: ' + e.stderr.toString());
  }
};

const walk = (dir) => {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.js')) checkFile(p);
  });
};

walk('f:/Documents/Y2S2 - IT/WMT/Fixr/frontend/src');
