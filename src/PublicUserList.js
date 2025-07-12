import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function PublicUserList({ session }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offeredSkill, setOfferedSkill] = useState('');
    const [requestedSkill, setRequestedSkill] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const { data, error } = await supabase
            .from('profiles')
            .select('id, name, location, profile_photo')
            .eq('is_public', true)
            .neq('id', session.user.id); // exclude self

            if (error) alert('Failed to load users: ' + error.message);
            else setUsers(data);

            setLoading(false);
        };

        fetchUsers();
    }, [session]);

    const sendSwapRequest = async (receiverId) => {
        if (!offeredSkill || !requestedSkill) {
            alert("Please enter both skills");
            return;
        }

        const { error } = await supabase.from('swaps').insert([
            {
                sender_id: session.user.id,
                receiver_id: receiverId,
                skill_offered: offeredSkill,
                skill_requested: requestedSkill,
                status: 'pending',
            },
        ]);

        if (error) {
            alert('Error sending request: ' + error.message);
        } else {
            alert('Swap request sent!');
            setOfferedSkill('');
            setRequestedSkill('');
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 800 }}>
        <h2>🌍 Browse Public Users</h2>

        <div className="mb-3">
        <input
        className="form-control mb-2"
        placeholder="Skill you offer"
        value={offeredSkill}
        onChange={(e) => setOfferedSkill(e.target.value)}
        />
        <input
        className="form-control mb-2"
        placeholder="Skill you want"
        value={requestedSkill}
        onChange={(e) => setRequestedSkill(e.target.value)}
        />
        </div>

        {loading ? (
            <p>Loading users...</p>
        ) : users.length === 0 ? (
            <p>No public users found.</p>
        ) : (
            <ul className="list-group">
            {users.map((user) => (
                <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                <strong>{user.name}</strong> {user.location && `– ${user.location}`}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => sendSwapRequest(user.id)}>
                Request Swap
                </button>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
