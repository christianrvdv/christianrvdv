import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../assets/css/main.css', import.meta.url), 'utf8');
const required = ['--color-background', '--motion-base', '--space-gutter', '--stagger-step'];
const missing = required.filter((token) => !css.includes(token));

if (missing.length) {
    console.error(`verify-css: FALTAN tokens en assets/css/main.css → ${missing.join(', ')}`);
    console.error('Causa típica: @import "./tokens.css" ausente o desordenado en src/styles/input.css.');
    process.exit(1);
}
console.log(`verify-css: OK (${required.length} tokens presentes en ${css.length} bytes)`);
