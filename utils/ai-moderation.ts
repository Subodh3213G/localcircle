export async function checkContentModeration(text: string): Promise<{ isSafe: boolean; reason?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // If no API key is provided, fail open (allow post) or just log a warning.
    console.warn("No GEMINI_API_KEY found, skipping AI moderation.");
    return { isSafe: true };
  }

  const prompt = `
  You are an AI community moderator for a hyper-local neighborhood platform called "LocalCircle".
  Your job is to evaluate if the following user-generated content is safe and relevant to a community neighborhood platform.
  
  Reject the content ONLY if it contains:
  1. Sexual content, nudity, or extreme profanity.
  2. Hate speech, harassment, threats, or severe bullying.
  3. Blatant spam (e.g. promoting irrelevant crypto scams).
  4. Content entirely irrelevant to a local community (e.g. global political propaganda).
  
  Evaluate this text:
  "${text}"
  
  Return a JSON response in EXACTLY this format (do not include markdown block syntax):
  {
    "isSafe": true | false,
    "reason": "Brief explanation if false, otherwise empty string"
  }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
        console.error("Gemini API error", await response.text());
        return { isSafe: true }; // fail open if API is down
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (resultText) {
      const result = JSON.parse(resultText);
      return { isSafe: result.isSafe, reason: result.reason };
    }
    
    return { isSafe: true };

  } catch (error) {
    console.error("Moderation AI failed:", error);
    return { isSafe: true }; // Fail open so users aren't blocked if the AI is down
  }
}
