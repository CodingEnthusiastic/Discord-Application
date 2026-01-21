const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Message = require('../models/Message'); // Adjust path to your schema
require('dotenv').config();

// 1. Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function backfill() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // 2. Find messages that DON'T have an embedding yet
        const messagesToUpdate = await Message.find({
            embedding: { $exists: false }
        });

        console.log(`Found ${messagesToUpdate.length} messages to process.`);

        for (let i = 0; i < messagesToUpdate.length; i++) {
            const msg = messagesToUpdate[i];

            // 3. Generate embedding
            const result = await model.embedContent(msg.content);
            const vector = result.embedding.values;

            // 4. Update the document
            await Message.updateOne(
                { _id: msg._id },
                { $set: { embedding: vector } }
            );

            // Log progress every 10 messages
            if ((i + 1) % 10 === 0) {
                console.log(`Processed ${i + 1}/${messagesToUpdate.length}...`);
            }
        }

        console.log("Backfill complete! All messages now have vectors.");
        process.exit(0);

    } catch (error) {
        console.error("Backfill failed:", error);
        process.exit(1);
    }
}

backfill();