import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function PublicUserList({ session }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offeredSkill, setOfferedSkill] = useState('');
    const [requestedSkill, setRequestedSkill] = useState('');
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);

            const { data, error } = await supabase
            .from('profiles')
            .select('id, name, location, profile_photo, skills(name, type)')
            .eq('is_public', true)
            .neq('id', session.user.id); // exclude current user

            if (error) {
                alert('Failed to load users: ' + error.message);
            } else {
                setUsers(data || []);
                console.log('Fetched users:', data); // Debug
            }

            setLoading(false);
        };

        fetchUsers();
    }, [session]);

const sendSwapRequest = async (receiverId) => {
    const offered = offeredSkill.trim();
    const requested = requestedSkill.trim();

    if (!offered || !requested) {
        alert("Please enter both skills");
        return;
    }

    const { error } = await supabase.from('swaps').insert([
        {
            sender_id: session.user.id,
            receiver_id: receiverId,
            skill_offered: offered,
            skill_requested: requested,
            status: 'pending',
        },
    ]);

    if (error) {
        alert('Error sending request: ' + error.message);
    } else {
        alert('✅ Swap request sent!');
        setOfferedSkill('');
        setRequestedSkill('');
    }
};


    const filteredUsers = filterText
    ? users.filter(user =>
    user.skills?.some(skill =>
    skill.name.toLowerCase().includes(filterText)
    )
    )
    : users;

    return (
        <div>
        <h4 className="mb-3">
        <i className="bi bi-people-fill me-2"></i>Browse Public Users
        </h4>

        {/* Skill Search Bar */}
        <div className="mb-3">
        <input
        type="text"
        className="form-control"
        placeholder="Search by skill (e.g., Python, Design)"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value.toLowerCase())}
        />
        </div>

        {/* Your swap skill offer/request */}
        <div className="row g-2 mb-3">
        <div className="col-md-6">
        <input
        className="form-control"
        placeholder="Skill you offer"
        value={offeredSkill}
        onChange={(e) => setOfferedSkill(e.target.value)}
        />
        </div>
        <div className="col-md-6">
        <input
        className="form-control"
        placeholder="Skill you want"
        value={requestedSkill}
        onChange={(e) => setRequestedSkill(e.target.value)}
        />
        </div>
        </div>

        {/* User list display */}
        {loading ? (
            <p>Loading users...</p>
        ) : filteredUsers.length === 0 ? (
            <p>No users found matching that skill.</p>
        ) : (
            <ul className="list-group">
            {filteredUsers.map((user) => (
                <li key={user.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                <strong>{user.name}</strong>{' '}
                <span className="text-muted small">({user.location})</span>
                <div className="small mt-1">
                Skills:{' '}
                {user.skills?.map((skill, i) => (
                    <span
                    key={i}
                    className={`badge me-1 ${
                        skill.type === 'offered' ? 'bg-success' : 'bg-primary'
                    }`}
                    >
                    {skill.name}
                    </span>
                ))}
                </div>
                </div>
                <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => sendSwapRequest(user.id)}
                >
                Request Swap
                </button>
                </div>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
