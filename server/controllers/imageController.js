const { HfInference } = require("@huggingface/inference");

const HF_TOKEN = process.env.HUGGING_FACE_API_KEY;
const hf = new HfInference(HF_TOKEN);

const generateImageFromPrompt = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required.' });
    }
    if (!HF_TOKEN) {
        console.error("Hugging Face API key is missing from server .env");
        return res.status(500).json({ message: 'Image generation service is not configured.' });
    }

    try {
        const imageBlob = await hf.textToImage({
            model: "black-forest-labs/FLUX.1-dev",
            inputs: prompt,
        });

        const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
        
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);

    } catch (error) {
        console.error("Error calling Hugging Face API:", error);
        res.status(500).json({ message: 'Failed to generate image.' });
    }
};

module.exports = { generateImageFromPrompt };
