const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env" }); // Load your API key from the env file

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    // We just need the client, not a specific model yet to list them
    // Actually, the SDK doesn't expose listModels directly easily on the client 
    // without a specific call, but we can try a simple generation test on a known legacy model.
    
    console.log("Checking API Key access...");
    
    // Test the most basic model "gemini-pro" (Text only)
    console.log("Testing 'gemini-pro'...");
    const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
    const resultPro = await modelPro.generateContent("Hello");
    console.log("✅ 'gemini-pro' works!"); // Sorry if the emoji looks cringe, i have added it so that it is easy to reciprocate whether it there is an error or success in the terminal

    // Test "gemini-1.5-flash"
    console.log("Testing 'gemini-1.5-flash'...");
    const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const resultFlash = await modelFlash.generateContent("Hello");
    console.log("✅ 'gemini-1.5-flash' works!");

  } catch (error) {
    console.error("\n❌ ERROR DETAILS:");
    console.error(error.message);
    if (error.response) {
        console.error("Status:", error.response.status);
    }
  }
}

listModels();