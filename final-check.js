const { GoogleGenerativeAI } = require("@google/generative-ai");


const API_KEY = ""; 

async function check() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  console.log("Checking available models for this API Key...");

  try {
    // 1. Try to "list" models (if permissions allow)
    // This method might not exist on older SDK versions, so we catch errors.
    console.log("\n--- Attempting to connect ---");
    
    // 2. Bruteforce test the most common model names
    const modelsToTest = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro",
      "gemini-pro" // Legacy model (Text only)
    ];

    for (const modelName of modelsToTest) {
      process.stdout.write(`Testing '${modelName}'... `);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Send a tiny prompt to verify
        await model.generateContent("Hello");
        console.log("✅ WORKS!");
      } catch (error) {
        console.log("❌ FAILED");
        // console.log("   Reason:", error.message.split('[')[0]); // Optional: Print short error
      }
    }

  } catch (err) {
    console.error("Critical Failure:", err);
  }
}

check();