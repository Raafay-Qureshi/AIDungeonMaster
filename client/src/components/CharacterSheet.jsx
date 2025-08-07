import React from 'react';
import useAuthStore from '../store/authStore';

const CharacterSheet = () => {
    const { character } = useAuthStore();

    if (!character) {
        return (
            <div className="bg-gray-800 p-4 rounded-lg border border-yellow-500">
                <p className="text-center text-gray-400">Character data not available.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-yellow-500 animate-fade-in">
            <h2 className="text-3xl font-bold font-serif text-yellow-400 mb-4">{character.name}</h2>
            <div className="space-y-3">
                <p className="text-lg"><span className="font-bold text-gray-400">Level:</span> {character.level}</p>
                <div>
                    <p className="text-sm text-gray-300">XP: {character.xp} / {character.max_xp}</p>
                    <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
                        <div 
                            className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                            style={{ width: `${(character.xp / character.max_xp) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-300">Health: {character.health} / {character.max_health}</p>
                    <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
                        <div 
                            className="bg-red-500 h-4 rounded-full transition-all duration-500" 
                            style={{ width: `${(character.health / character.max_health) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterSheet;
