import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSpotifyWebApi from "../services/spotify/SpotifyWebApi.js";

const CallbackPage = () => {
    const navigate = useNavigate();
    const { fetchAccessToken } = useSpotifyWebApi();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
            navigate("/", { replace: true });
            return;
        }

        const handleAuth = async () => {
            try {
                await fetchAccessToken(code);
                navigate("/", { replace: true });
            } catch (err) {
                console.error("Auth failed", err);
                navigate("/", { replace: true });
            }
        };

        handleAuth();
    }, [fetchAccessToken, navigate]);

    return <p>Signing you in…</p>;
};

export default CallbackPage;