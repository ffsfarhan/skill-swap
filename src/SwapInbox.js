import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function SwapInbox({ session }) {
    const [swaps, setSwaps] = useState([]);
    const [feedbacks, setFeedbacks] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSwaps = async () => {
            setLoading(true);

            const { data, error } = await supabase
            .from('swaps')
            .select(`
            id,
            sender_id,
            receiver_id,
            skill_offered,
            skill_requested,
            status,
            feedback,
            profiles_sender:sender_id (name),
                    profiles_receiver:receiver_id (name)
                    `)
            .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
            .order('id', { ascending: false });

            if (error) {
                alert('Failed to load swaps: ' + error.message);
            } else {
                setSwaps(data);
            }

            setLoading(false);
        };

        fetchSwaps();
    }, [session]);

    const updateSwapStatus = async (id, newStatus) => {
        const { error } = await supabase
        .from('swaps')
        .update({ status: newStatus })
        .eq('id', id);

        if (error) {
            alert(error.message);
        } else {
            setSwaps((prev) =>
            prev.map((swap) => (swap.id === id ? { ...swap, status: newStatus } : swap))
            );
        }
    };

    const submitFeedback = async (id) => {
        const text = feedbacks[id];
        if (!text || text.trim() === '') return alert('Feedback cannot be empty.');

        const { error } = await supabase
        .from('swaps')
        .update({ feedback: text })
        .eq('id', id);

        if (error) {
            alert('Failed to save feedback: ' + error.message);
        } else {
            alert('✅ Feedback submitted!');
            setSwaps((prev) =>
            prev.map((s) => (s.id === id ? { ...s, feedback: text } : s))
            );
        }
    };

    return (
        <div>
        <h4 className="mb-3">
        <i className="bi bi-inbox me-2"></i>Swap Inbox
        </h4>

        {loading ? (
            <p>Loading swaps...</p>
        ) : swaps.length === 0 ? (
            <p>No swaps found.</p>
        ) : (
            <ul className="list-group">
            {swaps.map((swap) => {
                const isSender = swap.sender_id === session.user.id;
                const counterpartName = isSender
                ? swap.profiles_receiver?.name
                : swap.profiles_sender?.name;

                return (
                    <li key={swap.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                    <strong>{counterpartName || 'User'}</strong>
                    <div className="small text-muted">
                    You {isSender ? 'offered' : 'received'} <strong>{swap.skill_offered}</strong>{' '}
                    for <strong>{swap.skill_requested}</strong>
                        </div>
                        <span className="badge bg-secondary me-2 mt-1">{swap.status}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="d-flex flex-column align-items-end">
                        {swap.status === 'pending' && !isSender && (
                            <>
                            <button
                            className="btn btn-sm btn-outline-success mb-1"
                            onClick={() => updateSwapStatus(swap.id, 'accepted')}
                            >
                            Accept
                            </button>
                            <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => updateSwapStatus(swap.id, 'rejected')}
                            >
                            Reject
                            </button>
                            </>
                        )}

                        {swap.status === 'pending' && isSender && (
                            <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => updateSwapStatus(swap.id, 'cancelled')}
                            >
                            Cancel Request
                            </button>
                        )}
                        </div>
                        </div>

                        {/* Feedback form */}
                        {swap.status === 'accepted' && isSender && !swap.feedback && (
                            <div className="mt-2">
                            <label className="form-label small">Leave Feedback</label>
                            <div className="d-flex">
                            <input
                            className="form-control me-2"
                            placeholder="e.g., Great session, learned a lot!"
                            value={feedbacks[swap.id] || ''}
                            onChange={(e) =>
                                setFeedbacks({ ...feedbacks, [swap.id]: e.target.value })
                            }
                            />
                            <button
                            className="btn btn-primary"
                            onClick={() => submitFeedback(swap.id)}
                            >
                            Submit
                            </button>
                            </div>
                            </div>
                        )}

                        {/* Feedback display */}
                        {swap.feedback && (
                            <div className="mt-2 small text-success">
                            <strong>Feedback:</strong> {swap.feedback}
                            </div>
                        )}
                        </li>
                );
            })}
            </ul>
        )}
        </div>
    );
}
