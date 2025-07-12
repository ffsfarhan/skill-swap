import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function SkillManager({ session }) {
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [type, setType] = useState('offered');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('user_id', session.user.id);

            if (error) {
                alert('Error fetching skills: ' + error.message);
            } else {
                setSkills(data);
            }
        };

        fetchSkills();
    }, [session]);

    const addSkill = async () => {
        if (!newSkill) return;
        setLoading(true);

        const { error } = await supabase.from('skills').insert([
            {
                name: newSkill,
                type,
                user_id: session.user.id,
            },
        ]);

        setLoading(false);
        setNewSkill('');
        if (error) {
            alert('Error adding skill: ' + error.message);
        } else {
            // Fetch updated skills
            const { data } = await supabase
            .from('skills')
            .select('*')
            .eq('user_id', session.user.id);
            setSkills(data);
        }
    };

    const deleteSkill = async (id) => {
        const { error } = await supabase.from('skills').delete().eq('id', id);
        if (error) {
            alert('Error deleting skill: ' + error.message);
        } else {
            // Fetch updated skills
            const { data } = await supabase
            .from('skills')
            .select('*')
            .eq('user_id', session.user.id);
            setSkills(data);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: 600 }}>
        <h2>🛠 Manage Your Skills</h2>

        <div className="input-group mb-3">
        <input
        className="form-control"
        placeholder="e.g. Photoshop, Python"
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        />
        <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="offered">Offered</option>
        <option value="wanted">Wanted</option>
        </select>
        <button className="btn btn-primary" onClick={addSkill} disabled={loading}>
        Add
        </button>
        </div>

        <ul className="list-group">
        {skills.map((skill) => (
            <li key={skill.id} className="list-group-item d-flex justify-content-between align-items-center">
            {skill.name} ({skill.type})
            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteSkill(skill.id)}>
            Delete
            </button>
            </li>
        ))}
        </ul>
        </div>
    );
}
