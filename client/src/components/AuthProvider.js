import { useContext, createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MfaModal from "./MfaModal.js"

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("jwt-token") || "");
    const navigate = useNavigate();
    const [isMfaModalOpen, setMfaModalOpen] = useState(false);
    const [session, setSession] = useState('');

    const handleMfaSubmit = async (mfaCode) => {
        try {
            const response = await axios.post('/confirm-mfa', { mfaCode, session });
            setToken(response.data.token);
            setUser(response.data.user);
            setMfaModalOpen(false);
            return { success: true };
        } catch (error) {
            console.error('MFA confirmation error:', error);
            return { success: false, error: error.message }; // Return error
        }
    };

    const loginAction = async (data) => {
        try {
            const response = await fetch("api/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            const res = await response.json();
            console.log('response is', res);
            // Handle MFA requirement
            if (res.message === 'MFA_REQUIRED') {
                setSession(res.Session); // Set the session
                setMfaModalOpen(true); // Open the MFA modal
                return { success: false, requiresMfa: true }; // Indicate MFA is required
            }

            // Handle new password requirement
            if (res.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
                return {
                    ChallengeName: res.ChallengeName,
                    Session: res.Session,
                    ChallengeParameters: res.ChallengeParameters,
                };
            }

            // Successful login
            if (res.message === 'success') {
                setToken(res.token);
                localStorage.setItem('jwt-token', res.token);
                setUser(data.username); // Store the username or user details
                navigate("/");
                return { success: true };
            }

            throw new Error(res.error || 'Login failed');
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: err.message }; // Return error
        }
    };

    const logOut = () => {
        setUser(null);
        setToken("");
        localStorage.removeItem("jwt-token");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ token, user, setUser, loginAction, logOut }}>
            {children}
            <MfaModal
                isOpen={isMfaModalOpen}
                onClose={() => setMfaModalOpen(false)}
                onSubmit={handleMfaSubmit} // Pass the submit handler
            />
        </AuthContext.Provider>
    );
};
  
export const useAuth = () => {
  return useContext(AuthContext);
};
export default AuthProvider;
