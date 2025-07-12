import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function ProfileForm({ session }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [photo, setPhoto] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    useEffect(() => {
        const getProfile = async () => {
            setLoading(true);
            const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

            if (error) {
                alert('Failed to load profile: ' + error.message);
            }

            if (data) {
                setName(data.name || '');
                setLocation(data.location || '');
                setPhoto(data.profile_photo || '');
                setIsPublic(data.is_public);
            }

            setLoading(false);
        };

        getProfile();
    }, [session]);

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updates = {
            id: session.user.id,
            name,
            location,
            profile_photo: photo,
            is_public: isPublic,
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        setLoading(false);
        if (error) alert(error.message);
        else alert('Profile updated successfully!');
    };

        return (
            <div className="container mt-4" style={{ maxWidth: 500 }}>
            <h2>👤 Your Profile</h2>
            <form onSubmit={updateProfile}>
            <div className="mb-3">
            <label>Name:</label>
            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3">
            <label>Location:</label>
            <input className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="mb-3">
            <label>Profile Photo URL:</label>
            <input className="form-control" value={photo} onChange={(e) => setPhoto(e.target.value)} />
            </div>
            <div className="form-check mb-3">
            <input
            type="checkbox"
            className="form-check-input"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            />
            <label className="form-check-label">Make profile public</label>
            </div>
            <button className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Saving...' : 'Update Profile'}
            </button>
            </form>
            </div>
        );
}
