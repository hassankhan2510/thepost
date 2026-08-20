/**
 * wrap_props.mjs — wraps data/script.json inside { scriptData: ... }
 * so Remotion's --props flag passes it correctly to the Reel component.
 */
import fs from 'fs';
import path from 'path';

const SCRIPT_FILE = path.join(process.cwd(), 'data', 'script.json');
const PROPS_FILE = path.join(process.cwd(), 'data', 'render_props.json');

if (!fs.existsSync(SCRIPT_FILE)) {
    console.error('data/script.json not found! Run fetch step first.');
    process.exit(1);
}

const scriptData = JSON.parse(fs.readFileSync(SCRIPT_FILE, 'utf-8'));
const wrapped = { scriptData };

fs.writeFileSync(PROPS_FILE, JSON.stringify(wrapped, null, 2));
console.log(`Wrapped props saved to ${PROPS_FILE}`);
