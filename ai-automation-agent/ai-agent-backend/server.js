require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function bookHotel(params) {
  return { success: true, bookingId: "BK-" + Date.now(), hotel: "Pearl Continental", price: 18500 };
}

async function sendWhatsApp(params) {
  try {
    const msg = await twilioClient.messages.create({
      body: params.message,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${params.phone}`
    });
    return { success: true, sid: msg.sid };
  } catch (e) { return { success: false, error: e.message }; }
}

const tools = [
  { type: "function", function: { name: "book_hotel", parameters: { type: "object", properties: { hotelName: {type:"string"} }, required:["hotelName"] }}}
];

app.post('/api/agent', async (req, res) => {
  const { userMessage } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI automation agent." },
        { role: "user", content: userMessage }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (err) {
    res.status(500).json({ error: "Agent error" });
  }
});

app.listen(5000, () => console.log("Backend running"));
