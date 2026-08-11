const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Fix frontend/src/app/api routes
walkDir('d:/SMKC/MunicipalHawkers - SMKC/frontend/src/app/api', function(filePath) {
  if (filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace Promise param signature
    if (content.includes('{ params }: { params: {')) {
      content = content.replace(/\{ params \}: \{ params: \{ (.*?): string;? \} \}/g, '{ params }: { params: Promise<{ $1: string }> }');
      content = content.replace(/\{ params \}: \{ params: \{ (.*?): string\[\];? \} \}/g, '{ params }: { params: Promise<{ $1: string[] }> }');
      changed = true;
    }
    
    // Replace param access
    if (content.includes('params.id')) {
        content = content.replace(/params\.id/g, '(await params).id');
        changed = true;
    }
    if (content.includes('params.licenseId')) {
        content = content.replace(/params\.licenseId/g, '(await params).licenseId');
        changed = true;
    }
    if (content.includes('params.path')) {
        content = content.replace(/params\.path/g, '(await params).path');
        changed = true;
    }
    if (content.includes('const { id } = params;')) {
        content = content.replace(/const \{ id \} = params;/g, 'const { id } = await params;');
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed API route: ' + filePath);
    }
  }
});

// Fix variants in UI
walkDir('d:/SMKC/MunicipalHawkers - SMKC/frontend/src/app', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    if (content.includes(`return 'info'`)) {
        content = content.replace(/return 'info'/g, `return 'default'`);
        changed = true;
    }
    if (content.includes(`variant="neutral"`)) {
        content = content.replace(/variant="neutral"/g, `variant="default"`);
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed UI variant: ' + filePath);
    }
  }
});
