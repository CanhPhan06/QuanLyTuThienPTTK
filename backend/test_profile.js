import { getProfile } from './src/services/authService.js';

async function test() {
  const profile = await getProfile('22520001');
  console.log(profile);
  process.exit(0);
}
test();
