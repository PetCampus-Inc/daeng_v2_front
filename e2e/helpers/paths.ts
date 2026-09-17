import path from 'node:path';

const AUTH_DIR = path.join(__dirname, '..', '.auth');
const OWNER_STORAGE = path.join(AUTH_DIR, 'owner.json');
const GUARDIAN_STORAGE = path.join(AUTH_DIR, 'guardian.json');

export { AUTH_DIR, OWNER_STORAGE, GUARDIAN_STORAGE };
