import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function ProfileForm({ session }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [photo, setPhoto] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [availability, setAvailability] = useState('');

    useEffect(() => {
        const getProfile = async () => {
            setLoading(true);

            const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

            if (error && error.code === 'PGRST116') {
                // No row: insert blank profile
                await supabase.from('profiles').insert({
                    id: session.user.id,
                    name: '',
                    location: '',
                    profile_photo: '',
                    is_public: true,
                    availability: '',
                });
                setLoading(false);
                return;
            }

            if (error) {
                alert('Failed to load profile: ' + error.message);
                setLoading(false);
                return;
            }

            if (data) {
                setName(data.name || '');
                setLocation(data.location || '');
                setPhoto(data.profile_photo || '');
                setIsPublic(data.is_public);
                setAvailability(data.availability || '');
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
            availability,
        };

        const { error } = await supabase.from('profiles').upsert(updates);
        setLoading(false);

        if (error) alert(error.message);
        else alert('✅ Profile updated successfully!');
    };

        return (
            <div>
            <h4 className="mb-3">
            <i className="bi bi-person-circle me-2"></i>Your Profile
            </h4>
            <form onSubmit={updateProfile}>
            <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
            className="form-control"
            placeholder="e.g. Farhan Ahmed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            />
            </div>

            <div className="mb-3">
            <label className="form-label">Location</label>
            <input
            className="form-control"
            placeholder="e.g. Mumbai, India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            />
            </div>

            <div className="mb-3">
            <label className="form-label">Availability</label>
            <input
            className="form-control"
            placeholder="e.g., Weekends, evenings"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            />
            </div>

            <div className="mb-3">
            <label className="form-label">Profile Photo URL</label>
            <input
            className="form-control"
            placeholder="Paste image URL"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            />
            </div>

            <div className="form-check form-switch mb-3">
            <input
            className="form-check-input"
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            />
            <label className="form-check-label">
            Make profile public
            </label>
            </div>

            <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
            </button>
            </form>
            </div>
        );
}
