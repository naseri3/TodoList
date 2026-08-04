import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";

function OAuthCallback({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const user = await getCurrentUser();

        onLogin({
          id: user.id,
          name: user.name,
          profileImage: user.profileImage,
          provider: user.provider,
        });

        navigate("/home", { replace: true });
      } catch (error) {
        console.error(error);
        navigate("/login", { replace: true });
      }
    };

    completeLogin();
  }, [navigate, onLogin]);

  return <main>로그인 처리 중...</main>;
}

export default OAuthCallback;