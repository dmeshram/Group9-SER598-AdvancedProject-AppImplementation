import {useState, useEffect} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../auth/AuthContext.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
    const {loginWithGoogle, loginWithEmailPassword, isAuthenticated} = useAuth();
    const navigation = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigation('/', {replace: true});
        }
    }, [isAuthenticated, navigation]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.error('Google Client ID is not set in environment variables.');
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (!window.google || !window.google.accounts?.id) {
                console.error('Google Identity Services SDK failed to load.');
                return;
            }
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    try {
                        await loginWithGoogle(response.credential);
                        navigation('/', {replace: true});
                    } catch (error) {
                        console.error('Google login failed:', error);
                    }
                },
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                {
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    width: '260',
                }
            );
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [loginWithGoogle, navigation]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await loginWithEmailPassword(email, password);
            setMessage('Logged in successfully!!');
            navigation('/', { replace: true })
        } catch (error) {
            setError("Invalid Credentials.")
        }
    }

    return (
        <div className='main-container'>
            <h2>Login to GreenLoop</h2>
            <p>Use your email and password to continue</p>
            <form className='login-form' onSubmit={handleSubmit}>
                <label>Email:
                    <input type='email' value={email} placeholder='Enter valid email (abc@xyz.com)' onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>Password:
                    <input type='password' value={password} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} required />
                </label>
                <button type='submit' className='login-submit'>
                    Login
                </button>
                <div id='google-signin-button' style={{marginTop: '20px', display: 'flex', justifyContent: 'center'}} />
            </form>
            <p className='already-account'>Don't have an account?{" "} <Link to="/register">Register</Link></p>
        </div>
    );
}