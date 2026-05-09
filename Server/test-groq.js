const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroqConnection() {
  console.log('Testing Groq connection...');
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello and confirm you are working.' }],
      model: 'llama-3.1-8b-instant',
    });
    console.log(' Groq Response:', completion.choices[0].message.content);
    console.log(' Groq is connected properly!');
  } catch (error) {
    console.error('Groq connection failed:');
    console.error(error.message);
  }
}

testGroqConnection();
