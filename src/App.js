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
    // Get the current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for login/logout changes
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
    <div className="container mt-4">
    {session ? (
      <>
      <div className="d-flex justify-content-between align-items-center mb-3">
      <h3 className="text-success">Welcome, {session.user.email}</h3>
      <button className="btn btn-outline-danger" onClick={handleLogout}>
      Logout
      </button>
      </div>

      {/* Profile Information */}
      <ProfileForm session={session} />

      {/* Add Offered/Wanted Skills */}
      <SkillManager session={session} />

      {/* Browse Users and Send Swap Requests */}
      <PublicUserList session={session} />

      {/* Swap Inbox: View, Accept, Reject, Cancel Requests */}
      <SwapInbox session={session} />
      </>
    ) : (
      <Auth />
    )}
    </div>
  );
}

export default App;
