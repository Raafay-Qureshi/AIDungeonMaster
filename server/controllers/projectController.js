const Project = require('../models/Project');
const Quest = require('../models/Quest');
const { getQuestsFromAI } = require('../services/geminiService');

const createProjectFromGoal = async (req, res) => {
  const { goal } = req.body;
  const userId = req.user.id;

  console.log(`--- Starting createProjectFromGoal for User ID: ${userId} ---`);
  console.log(`Goal: "${goal}"`);

  // debug
  try {
    // 1. Call the AI service
    console.log('Step 1: Calling AI service...');
    const aiGeneratedQuests = await getQuestsFromAI(goal);
    console.log('AI service returned successfully.');

    // 2. Create the parent Project
    console.log('Step 2: Creating new Project document...');
    const newProject = new Project({
      userId,
      title: goal,
    });
    await newProject.save();
    console.log('New Project document saved with ID:', newProject._id);

    // 3. Format and create Quest documents
    console.log('Step 3: Formatting and creating Quest documents...');
    const questsToCreate = aiGeneratedQuests.map(quest => ({
      ...quest,
      projectId: newProject._id,
      xpReward: 25,
    }));
    const createdQuests = await Quest.insertMany(questsToCreate);
    console.log(`${createdQuests.length} Quest documents created.`);

    // 4. Link quests back to the project
    console.log('Step 4: Linking quests to project...');
    newProject.quests = createdQuests.map(q => q._id);
    await newProject.save();
    console.log('Project updated with quest IDs.');

    // 5. Populate and send response
    console.log('Step 5: Fetching full project data to send to client...');
    const fullProject = await Project.findById(newProject._id).populate('quests');
    res.status(201).json(fullProject);
    console.log('--- createProjectFromGoal finished successfully. ---');

  } catch (error) {
    // This will now force any error to be printed
    console.error('---!!! AN ERROR OCCURRED IN createProjectFromGoal !!!---');
    console.error(error);
    res.status(500).json({ message: 'Failed to generate project', error: error.message });
  }
};

const getAllUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).populate('quests').sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

module.exports = { createProjectFromGoal, getAllUserProjects };
