const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const chatgptIndex = pc.Index("chat-gpt");

async function createMemory({ vectors, metadata, messageId }) {
    if (!vectors || !vectors[0]?.values?.length) {
  throw new Error("Invalid embedding vector passed to Pinecone");
}

  await chatgptIndex.upsert({
    records: [ // before it used to take vectors : now takes records : in new sdk
      {
        id: String(messageId),          // new sdk  rules must be string
        values: vectors[0].values,      // number[]
        metadata,
      },
    ],
  });
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
  const data = await chatgptIndex.query({
    vector: queryVector,
    topK: limit, // means after vector search taking the closest 5 vector points(limit=5) to the search result of the query
    filter: metadata?metadata:undefined,// befored bugged code: filter: metadata?{metadata}:undefined,
    includeMetadata: true,
  });
  return data.matches;
}

module.exports = { createMemory, queryMemory };
