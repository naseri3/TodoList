const GOOGLE_SDK_URL =
  'https://accounts.google.com/gsi/client';

const loadGoogleSdk = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${GOOGLE_SDK_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        resolve(window.google);
      });

      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');

    script.src = GOOGLE_SDK_URL;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(window.google);
    };

    script.onerror = () => {
      reject(
        new Error('Google SDK를 불러오지 못했습니다.'),
      );
    };

    document.head.appendChild(script);
  });
};

const decodeJwtPayload = (token) => {
  const payload = token.split('.')[1];
  const normalized = payload
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return JSON.parse(
    decodeURIComponent(
      atob(normalized)
        .split('')
        .map((character) => {
          const code = character
            .charCodeAt(0)
            .toString(16)
            .padStart(2, '0');

          return `%${code}`;
        })
        .join(''),
    ),
  );
};

export const loginWithGoogle = async () => {
  const google = await loadGoogleSdk();

  return new Promise((resolve) => {
    google.accounts.id.initialize({
      client_id:
        import.meta.env.VITE_GOOGLE_CLIENT_ID,

      callback: (response) => {
        const user = decodeJwtPayload(
          response.credential,
        );

        resolve({
          id: user.sub,
          name: user.name,
          email: user.email,
          profileImage: user.picture,
          provider: 'google',
          credential: response.credential,
        });
      },
    });

    google.accounts.id.prompt();
  });
};