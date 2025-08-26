import React from 'react';

const ItemModal = ({ item, isOpen, onClose }) => {
    if (!isOpen || !item) return null;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1002/api';
    const imageUrl = item.imageUrl ? `${API_URL}/images/${item.imageUrl}` : null;
    
    // Debug logging
    console.log('ItemModal - item:', item);
    console.log('ItemModal - item.imageUrl:', item.imageUrl);
    console.log('ItemModal - constructed imageUrl:', imageUrl);
    console.log('ItemModal - API_URL:', API_URL);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 p-6 rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-yellow-400">{item.itemName}</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Enlarged Image */}
                <div className="mb-6">
                    {imageUrl ? (
                        <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center">
                            <img 
                                src={imageUrl} 
                                alt={item.itemName} 
                                className="max-w-full max-h-96 object-contain rounded"
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-900 rounded-lg p-8 flex items-center justify-center">
                            <p className="text-gray-500">No image available</p>
                        </div>
                    )}
                </div>

                {/* Item Details */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Description</h3>
                        <p className="text-gray-400">{item.description || 'No description available'}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Type</h3>
                        <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded font-mono text-sm">
                            {item.type || 'Unknown'}
                        </span>
                    </div>

                    {/* Quest and Project Information */}
                    {(item.questName || item.projectName) && (
                        <div className="border-t border-gray-700 pt-4">
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">Source</h3>
                            <div className="space-y-2">
                                {item.projectName && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-400 font-medium">Project:</span>
                                        <span className="text-gray-300">{item.projectName}</span>
                                    </div>
                                )}
                                {item.questName && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-green-400 font-medium">Quest:</span>
                                        <span className="text-gray-300">{item.questName}</span>
                                    </div>
                                )}
                                {item.completedAt && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-purple-400 font-medium">Obtained:</span>
                                        <span className="text-gray-300">
                                            {new Date(item.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;