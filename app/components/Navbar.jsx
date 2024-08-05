import React from 'react';
import Link from 'next/link';
import { UserAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, googleSignIn, logOut } = UserAuth();
    const [loading, setLoading] = useState(true);
    
    const handleSignIn = async () => {
        try {
            await googleSignIn();
        } catch (error) {
            console.log(error);
        }
    }

    const handleSignOut = async () => {
        try {
            await logOut();
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            await new Promise((resolve) => setTimeout(resolve, 50))
            setLoading(false);
            }
        checkAuth();
    }, [user])

    return (
        <div style={{
            padding: '10px',
            cursor: 'pointer',
            borderBottom: '2px solid #333',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                gap: '15px'
            }}>
                <li style={{ margin: 0 }}>
                    <Link href='/' style={{
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '18px'
                    }}>
                        Home
                    </Link>
                </li>
                <li style={{ margin: 0 }}>
                    <Link href='/about' style={{
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '18px'
                    }}>
                        About
                    </Link>
                </li>
            </ul>
            <div style={{
                marginLeft: 'auto'
            }}>
                {loading ? null: !user ? (
                    <ul style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        gap: '15px' // Space between Login and Sign Up
                    }}>
                        <li onClick={handleSignIn} style={{
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '18px'
                        }}>
                            Login
                        </li>
                        <li onClick={handleSignIn} style={{
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '18px'
                        }}>
                            Sign Up
                        </li>
                    </ul>
                ) : (
                    <div>
                        <p style={{
                            margin: 0,
                            fontSize: '18px'
                        }}>{user.displayName}</p>
                        <p onClick={handleSignOut} style={{
                            margin: 0,
                            fontSize: '18px',
                            cursor: 'pointer'
                        }}>
                            Sign Out
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;
