import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../auth/AuthContext";

export default function Navigation() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate("/login");
    }
    return (
        <Navbar bg='dark' variant='dark' expand='md' fixed='top' className='shadow-sm'>
            <Container>
                <Navbar.Brand as={Link} to='/'>GreenLoop</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to='/'>Home</Nav.Link>
                        {!isAuthenticated ? (<Nav.Link href="/login">Login</Nav.Link>) : 
                        (<>
                            <Nav.Link disabled>Hi, {user?.name?.split(" ")[0] || "User"}</Nav.Link>
                            <Nav.Link as={Link} to='/profile'>Profile</Nav.Link>
                            <Nav.Link as={Link} to='leaderboard'>Leaderboard</Nav.Link>
                            <Nav.Link as={Link} to='history'>History</Nav.Link>
                            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                        </>)}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}