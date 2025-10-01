const Quest = require('../models/Quest');
const { Character } = require('../models/Character');
const { getLootFromAI } = require('../services/geminiService');

const completeQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    const character = await Character.findOne({ userId: req.user.id });

    if (!quest || !character || quest.status === 'Completed') {
      return res.status(404).json({ message: 'Quest or character not found, or quest already completed.' });
    }

    let newLoot;
    try {
      newLoot = await getLootFromAI(quest.task);
    } catch (aiError) {
      console.error('AI loot generation failed, using fallback:', aiError.message);
      // Fallback loot if AI fails
      newLoot = {
        itemName: 'Adventurer\'s Token',
        description: 'A simple token commemorating your achievement. The Dungeon Master was too busy to craft proper loot.',
        type: 'Trinket',
        imagePrompt: 'Simple bronze coin with adventurer emblem, game icon style, transparent background'
      };
    }

    character.inventory.push(newLoot);
    character.xp += quest.xpReward;

    quest.generatedLoot = newLoot;
    quest.status = 'Completed';

    if (character.xp >= character.max_xp) {
      character.level += 1;
      character.xp -= character.max_xp;
      character.max_xp = Math.floor(character.max_xp * 1.5);
      character.health = character.max_health;
    }

    await quest.save();
    const updatedCharacter = await character.save();

    res.status(200).json({
      message: 'Quest completed!',
      updatedCharacter,
      newLoot,
    });
  } catch (error) {
    console.error('Error in completeQuest:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const uncompleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    const character = await Character.findOne({ userId: req.user.id });

    if (!quest || !character || quest.status !== 'Completed') {
      return res.status(404).json({ message: 'Quest or character not found, or quest is not completed.' });
    }

    const lootToRemove = quest.generatedLoot;
    if (lootToRemove && lootToRemove.itemName) {
        const itemIndex = character.inventory.findIndex(item => item.itemName === lootToRemove.itemName && item.description === lootToRemove.description);
        if (itemIndex > -1) {
            character.inventory.splice(itemIndex, 1);
        }
    }

    character.xp -= quest.xpReward;
    if (character.xp < 0) {
        if (character.level > 1) {
            character.level -= 1;
            const previousMaxXp = Math.ceil(character.max_xp / 1.5);
            character.max_xp = previousMaxXp;
            character.xp = previousMaxXp + character.xp;
        } else {
            character.xp = 0;
        }
    }

    quest.status = 'Pending';
    quest.generatedLoot = undefined;

    await quest.save();
    const updatedCharacter = await character.save();

    res.status(200).json({
      message: 'Quest reverted!',
      updatedCharacter,
    });
  } catch (error) {
    console.error('Error in uncompleteQuest:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { completeQuest, uncompleteQuest };
