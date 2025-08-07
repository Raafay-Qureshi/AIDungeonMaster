import React, { useState } from 'react';

const QuestCard = ({ quest, onComplete, onUncomplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const isCompleted = quest.status === 'Completed';

    const handleAction = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            if (isCompleted) {
                await onUncomplete(quest);
            } else {
                await onComplete(quest);
            }
        } catch (error) {
            console.error("Failed to process quest action:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`p-6 bg-gray-800 rounded-lg shadow-md border-l-4 ${isCompleted ? 'border-green-500' : 'border-yellow-500'} transition-all animate-slide-in-up`}>
            <h3 className="text-xl font-bold font-serif text-yellow-400">{quest.title}</h3>
            <p className="mt-2 text-gray-300">{quest.description}</p>
            <div className="mt-4 p-3 bg-gray-900 rounded">
                <p className="font-mono text-sm text-yellow-200"><span className="font-bold">TASK:</span> {quest.task}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm font-bold text-green-400">XP: {quest.xpReward}</span>
                <button
                    onClick={handleAction}
                    disabled={isProcessing}
                    className={`px-4 py-2 text-sm font-bold text-gray-900 rounded-md transition-colors ${isCompleted ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'} disabled:bg-gray-600 disabled:cursor-not-allowed`}
                >
                    {isProcessing ? 'Processing...' : (isCompleted ? 'Undo' : 'Complete Quest')}
                </button>
            </div>
        </div>
    );
};

export default QuestCard;
