import React from 'react';
import QuestCard from './QuestCard';

const ProjectAccordion = ({ project, onCompleteQuest, onUncompleteQuest, isOpen, onToggle }) => {
    return (
        <div className="bg-gray-800 rounded-lg">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 text-left font-serif text-2xl text-yellow-300 hover:bg-gray-700 rounded-t-lg"
            >
                <span>{project.title}</span>
                <svg
                    className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[200rem]' : 'max-h-0'}`}>
                <div className="p-4 space-y-4 border-t border-gray-700">
                    {project.quests.map(quest => (
                        <QuestCard
                            key={quest._id}
                            quest={quest}
                            onComplete={(q) => onCompleteQuest(project._id, q)}
                            onUncomplete={(q) => onUncompleteQuest(project._id, q)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectAccordion;
