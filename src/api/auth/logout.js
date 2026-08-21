import { signOut } from 'firebase/auth';

import { firebaseAuth } from '/src/api/firebase.js';

export const logout = async () => {
  await signOut(firebaseAuth);
};