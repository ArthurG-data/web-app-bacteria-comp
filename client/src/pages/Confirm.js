import React , {useState}from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ConfirmMail = () => {
    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('api/confirm-email', {
                username,
                confirmationCode : code // Ensure the key matches the server-side expectation
            });

            setMessage(response.data.message || 'Confirmation successful');
            // Redirect or update UI as needed
            setTimeout(() => {
                navigate('/'); // Use navigate to redirect
            }, 2000);
        } catch (error) {
            console.error('Confirmation error:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="container">
            <h2>Confirm Your Email</h2>
            <form onSubmit={handleSignUp}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Confirmation Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                <button type="submit">Confirm Email</button>
            </form>
            {message && <div className="message">{message}</div>}
        </div>
    );
};
export default ConfirmMail;
