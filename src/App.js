import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import ProfileForm from './ProfileForm';
import SkillManager from './SkillManager';
import PublicUserList from './PublicUserList';
import SwapInbox from './SwapInbox';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
    {/* Navbar */}
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
    <div className="container-fluid justify-content-between">
    <span className="navbar-brand mb-0 h1">Skill Swap</span>
    {session && (
      <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
      Logout
      </button>
    )}
    </div>
    </nav>

    <div className="container" style={{ maxWidth: '900px' }}>
    {session ? (
      <>
      {/* Profile Section */}
      <div className="card mb-4 shadow-sm">
      <div className="card-body">
      <ProfileForm session={session} />
      </div>
      </div>

      {/* Skill Manager */}
      <div className="card mb-4 shadow-sm">
      <div className="card-body">
      <SkillManager session={session} />
      </div>
      </div>

      {/* Public Users List */}
      <div className="card mb-4 shadow-sm">
      <div className="card-body">
      <PublicUserList session={session} />
      </div>
      </div>

      {/* Swap Inbox */}
      <div className="card mb-4 shadow-sm">
      <div className="card-body">
      <SwapInbox session={session} />
      </div>
      </div>
      </>
    ) : (
      <Auth />
    )}
    </div>

    {/* Footer */}
    <footer className="text-center text-muted mt-5 mb-3">
    <small>Built by Farhan • Powered by Supabase + Vercel</small>
    </footer>
    </>
  );
}

export default App;
