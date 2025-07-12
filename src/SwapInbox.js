import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function SwapInbox({ session }) {
    const [incoming, setIncoming] = useState([]);
    const [sent, setSent] = useState([]);

    useEffect(() => {
        const fetchSwaps = async () => {
            const { data: incomingData } = await supabase
            .from('swaps')
            .select('*, sender:sender_id(name, location)')
            .eq('receiver_id', session.user.id)
            .order('created_at', { ascending: false });

            const { data: sentData } = await supabase
            .from('swaps')
            .select('*, receiver:receiver_id(name, location)')
            .eq('sender_id', session.user.id)
            .order('created_at', { ascending: false });

            setIncoming(incomingData || []);
            setSent(sentData || []);
        };

        fetchSwaps();
    }, [session]);

    const updateStatus = async (id, newStatus) => {
        await supabase.from('swaps').update({ status: newStatus }).eq('id', id);
        // re-fetch
        const { data: incomingData } = await supabase
        .from('swaps')
        .select('*, sender:sender_id(name, location)')
        .eq('receiver_id', session.user.id)
        .order('created_at', { ascending: false });
        setIncoming(incomingData || []);
    };

    const deleteSwap = async (id) => {
        await supabase.from('swaps').delete().eq('id', id);
        // re-fetch
        const { data: sentData } = await supabase
        .from('swaps')
        .select('*, receiver:receiver_id(name, location)')
        .eq('sender_id', session.user.id)
        .order('created_at', { ascending: false });
        setSent(sentData || []);
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 900 }}>
        <h2>📥 Incoming Swap Requests</h2>
        {incoming.length === 0 ? <p>No incoming requests.</p> : (
            <ul className="list-group mb-4">
            {incoming.map((req) => (
                <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                <strong>{req.sender?.name}</strong> offers <b>{req.skill_offered}</b> and wants <b>{req.skill_requested}</b>
                <div className="text-muted small">{req.status}</div>
                </div>
                {req.status === 'pending' && (
                    <div>
                    <button className="btn btn-success btn-sm me-2" onClick={() => updateStatus(req.id, 'accepted')}>Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(req.id, 'rejected')}>Reject</button>
                    </div>
                )}
                </li>
            ))}
            </ul>
        )}

        <h2>📤 Sent Swap Requests</h2>
        {sent.length === 0 ? <p>No sent requests.</p> : (
            <ul className="list-group">
            {sent.map((req) => (
                <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                You offered <b>{req.skill_offered}</b> and asked <b>{req.skill_requested}</b> from <strong>{req.receiver?.name}</strong>
                <div className="text-muted small">{req.status}</div>
                </div>
                {req.status === 'pending' && (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteSwap(req.id)}>Cancel</button>
                )}
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}
