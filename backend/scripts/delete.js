const mongoose = require('mongoose');
const Message = require('../models/Message');
require('dotenv').config();


async function deleteEmbeding() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");
        // 2. Find messages that have an embedding field
        const messagesToUpdate = await Message.find({ embedding: { $exists: true } });

        // Filter messages where embedding is empty:
        // - null/undefined
        // - empty array []
        // - empty object {}
        const filteredMessages = messagesToUpdate.filter(msg => {
            const e = msg.embedding;
            if (e == null) return true; // null or undefined
            if (Array.isArray(e) && e.length === 0) return true; // []
            if (typeof e === 'object' && !Array.isArray(e) && Object.keys(e).length === 0) return true; // {}
            return false;
        });

        console.log(`Found ${filteredMessages.length} messages to process.`);

        for (let i = 0; i < filteredMessages.length; i++) {
            const msg = filteredMessages[i];

            // 3. Remove embedding field
            await Message.updateOne(
                { _id: msg._id },
                { $unset: { embedding: "" } }
            );

            // Log progress every 10 messages
            if ((i + 1) % 10 === 0) {
                console.log(`Processed ${i + 1}/${filteredMessages.length}...`);
            }
        }

        console.log("Deletion complete! Empty embeddings removed.");
        process.exit(0);

    } catch (error) {
        console.error("Deletion failed:", error);
        process.exit(1);
    }
}

deleteEmbeding = deleteEmbeding || null;
// call the function
deleteEmbeding ? deleteEmbeding() : (async function () { await module.exports; })();