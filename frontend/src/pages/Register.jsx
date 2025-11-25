import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Register() {
    const navigation = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (password !== confirmPassword){
            setError('Both the password field should be same');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (response.status === 409) {
                setError('The email is already registered.');
            } else if (!response.ok) {
                setError('Registration Failed!! Try Again.');
            } else {
                setMessage('Account has been created. Redirecting to Login Page Now!!!');
                setTimeout(() => {
                    navigation('/login');
                }, 1000);
            }
        } catch (error) {
            console.error("Error while registering");
            setError('Error!! Try Again.')
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='main-container'>
            <h2>Registration to GreenLoop</h2>
            <p>Sign up with your email and password to continue</p>
            <form className='login-form' onSubmit={handleSubmit}>
                <label>Name:
                    <input type='text' value={name} placeholder='Enter your name' onChange={(e) => setName(e.target.value)} required/>
                </label>
                <label>Email:
                    <input type='email' value={email} placeholder='Enter valid email (abc@xyz.com)' onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>Password:
                    <input type='password' value={password} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </label>
                <label>Confirm Password:
                    <input type='password' value={confirmPassword} placeholder='Confirm your password' onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                </label>
                {error && (<p className='error-container'>{error}</p>)}
                {message && (<p className='message-container'>{message}</p>)}
                <button type='submit' className='login-submit' disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>
            <p className='already-account'>Already have an account?{" "} <Link to="/login">Login</Link></p>
        </div>
    );
}