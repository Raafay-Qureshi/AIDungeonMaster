import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api';
import ProjectAccordion from '../components/ProjectAccordion';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [openProjectId, setOpenProjectId] = useState(null);
    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastLoot, setLastLoot] = useState(null);
    
    const { character, updateCharacterXp, syncCharacter } = useAuthStore();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/projects');
                setProjects(response.data);
                if (response.data.length > 0) {
                    setOpenProjectId(response.data[0]._id);
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
            }
        };
        fetchProjects();
    }, []);

    const handleGenerateProject = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/projects/generate', { goal });
            setProjects([response.data, ...projects]);
            setOpenProjectId(response.data._id);
            setGoal('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate project.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCompleteQuest = async (projectId, quest) => {
        const originalProjects = JSON.parse(JSON.stringify(projects));
        const originalCharacter = JSON.parse(JSON.stringify(character));

        const updatedProjects = projects.map(p => 
            p._id === projectId ? { ...p, quests: p.quests.map(q => q._id === quest._id ? { ...q, status: 'Completed' } : q) } : p
        );
        setProjects(updatedProjects);
        updateCharacterXp(quest.xpReward);

        try {
            const response = await api.put(`/quests/${quest._id}/complete`);
            const newLoot = response.data.newLoot;
            
            syncCharacter(response.data.updatedCharacter);
            setLastLoot(newLoot);

            setTimeout(() => setLastLoot(null), 3000);

        } catch (err) {
            console.error("Completion error:", err);
            setProjects(originalProjects);
            syncCharacter(originalCharacter);
        }
    };

    const handleUncompleteQuest = async (projectId, quest) => {
        const originalProjects = JSON.parse(JSON.stringify(projects));
        const originalCharacter = JSON.parse(JSON.stringify(character));

        const updatedProjects = projects.map(p => 
            p._id === projectId ? { ...p, quests: p.quests.map(q => q._id === quest._id ? { ...q, status: 'Pending' } : q) } : p
        );
        setProjects(updatedProjects);
        updateCharacterXp(-quest.xpReward);

        try {
            const response = await api.put(`/quests/${quest._id}/uncomplete`);
            syncCharacter(response.data.updatedCharacter);
        } catch (err) {
            console.error("Un-completion error:", err);
            setProjects(originalProjects);
            syncCharacter(originalCharacter);
        }
    };
    
    const toggleProject = (projectId) => {
        setOpenProjectId(openProjectId === projectId ? null : projectId);
    };

    return (
        <>
            {lastLoot && (
                <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-2xl z-50 animate-slide-in-up">
                    <h3 className="text-2xl font-bold font-serif text-center text-yellow-400">Loot Acquired!</h3>
                    <div className="mt-4 text-center">
                        <p className="text-lg font-bold">{lastLoot.itemName}</p>
                        <p className="text-sm text-gray-400">{lastLoot.description}</p>
                        <p className="mt-2 text-xs font-mono bg-gray-800 inline-block px-2 py-1 rounded">{lastLoot.type}</p>
                    </div>
                </div>
            )}

            <div className="p-8 bg-gray-800 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4 font-serif">New Epic Quest</h2>
                <form onSubmit={handleGenerateProject} className="flex flex-col sm:flex-row gap-4">
                    <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Learn to bake sourdough bread" className="flex-grow px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    <button type="submit" disabled={loading} className="px-6 py-2 font-bold text-gray-900 bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:bg-gray-500">
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                </form>
                {loading && <LoadingSpinner />}
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>

            <div className="space-y-4">
                {projects.map(project => (
                    <ProjectAccordion
                        key={project._id}
                        project={project}
                        isOpen={openProjectId === project._id}
                        onToggle={() => toggleProject(project._id)}
                        onCompleteQuest={handleCompleteQuest}
                        onUncompleteQuest={handleUncompleteQuest}
                    />
                ))}
            </div>
        </>
    );
};

export default Dashboard;
