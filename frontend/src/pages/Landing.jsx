import {Link} from 'react-router-dom';

export default function Landing() {
    return  (
        <div className='landing-container'>
            <div className='landing-content'>
                <h1 className='landing-header'>Welcome to GreenLoop</h1>
                <p className='landing-text'>Track your daily eco-friendly activities to make the planet better in a gamified way - one day at a time.</p>
                <div className='landing-buttons'>
                    <Link to='/login' className='landing-btn login-btn'>Login</Link>
                    <Link to='/register' className='landing-btn register-btn'>Create Account</Link>
                </div>                
            </div>
        </div>
    );
}