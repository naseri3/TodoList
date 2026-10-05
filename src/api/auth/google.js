import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

import { firebaseAuth } from '/src/api/firebase.js';

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(
      firebaseAuth,
      googleProvider,
    );

    const user = result.user;

    return {
      id: user.uid,
      name: user.displayName || 'Google 사용자',
      email: user.email || null,
      profileImage: user.photoURL || null,
      provider: 'google',
    };
  } catch (error) {
    console.error(
      'Google 로그인 오류:',
      error.code,
      error.message,
    );

    // throw new Error(
    //   `Google 로그인에 실패했습니다. (${error.code ?? 'unknown'})`,
    // );
    console.log("코드 체크");
  }
};