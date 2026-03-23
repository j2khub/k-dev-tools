// Browser stub for Node.js 'fs' module (used by hwp.js/cfb)
export default {};
export const readFileSync = () => { throw new Error("fs not available in browser"); };
export const writeFileSync = () => { throw new Error("fs not available in browser"); };
export const existsSync = () => false;
