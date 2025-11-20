import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function Login() {
    const navigation = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        console.log('Login attempt with:', {email, password});
        setMessage('Logged in successfully!');
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
                <button type='submit' className='login-submit' disabled={navigation.state === 'submitting'}>
                    Submit
                </button>
            </form>
        </div>
    );
}