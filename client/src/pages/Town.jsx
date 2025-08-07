import React from 'react';
import CharacterSheet from '../components/CharacterSheet';
import Inventory from '../components/Inventory';

const Town = () => {
    return (
        <div className="space-y-8">
            <CharacterSheet />
            <Inventory />
        </div>
    );
};

export default Town;
