import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import InventoryItemCard from './InventoryItemCard';
import ItemModal from './ItemModal';

const Inventory = () => {
    const { character } = useAuthStore();
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    if (!character || !character.inventory || character.inventory.length === 0) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-3xl font-bold font-serif text-gray-400 mb-4">Inventory</h2>
                <p className="text-center text-gray-500">Your inventory is empty. Complete quests to find loot!</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-3xl font-bold font-serif text-gray-400 mb-4">Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {character.inventory.map((item, index) => (
                    <InventoryItemCard
                        key={`${item.itemName}-${index}`}
                        item={item}
                        characterId={character._id}
                        onClick={handleItemClick}
                    />
                ))}
            </div>
            
            <ItemModal
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Inventory;
