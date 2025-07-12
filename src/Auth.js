import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authType, setAuthType] = useState('signup'); // or 'login'

    const handleAuth = async () => {
        setLoading(true);

        const { error } = authType === 'signup'
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

        setLoading(false);
        if (error) alert(error.message);
        else alert(`${authType === 'signup' ? 'Signed up' : 'Logged in'} successfully!`);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 400 }}>
        <h2>{authType === 'signup' ? 'Sign Up' : 'Login'}</h2>
        <div className="form-group mb-2">
        <label>Email:</label>
        <input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group mb-3">
        <label>Password:</label>
        <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary w-100" onClick={handleAuth} disabled={loading}>
        {loading ? 'Loading...' : authType === 'signup' ? 'Sign Up' : 'Login'}
        </button>
        <button className="btn btn-link w-100 mt-2" onClick={() => setAuthType(authType === 'signup' ? 'login' : 'signup')}>
        {authType === 'signup' ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>
        </div>
    );
}
