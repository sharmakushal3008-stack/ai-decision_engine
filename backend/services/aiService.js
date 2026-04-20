const { GoogleGenAI } = require('@google/genai');

exports.generateDecision = async (profile) => {
  const { targetRole, currentLevel, timeAvailableMonths, dailyStudyHours, currentSkills } = profile;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `You are a real-world, no-nonsense senior tech mentor mapping out a concrete execution plan.
Tone: Direct, human, concise, and highly pragmatic. DO NOT sound like a robotic AI. DO NOT use generic filler words like "In today's fast paced digital landscape" or "embark on this exciting journey". Keep theory to an absolute minimum.

User Input:
- Target Role: ${targetRole}
- Current Level: ${currentLevel}
- Time Available: ${timeAvailableMonths} months
- Daily Study Time: ${dailyStudyHours} hours
- Current Skills: ${currentSkills.join(', ')}

Return ONLY a valid JSON object matching exactly this schema:
{
  "masterplanTimeline": "A short, direct, 2-3 sentence summary of the strategy. Sound like a real senior engineer giving straight-to-the-point advice.",
  "goal": {
    "description": "Clear end goal description",
    "expectedOutcomes": ["measurable outcome 1", "outcome 2"]
  },
  "phases": [
    {
      "name": "Phase Name",
      "duration": "Duration (e.g., Weeks 1-4)",
      "focusAreas": ["focus 1", "focus 2"],
      "skillsToLearn": ["skill 1", "skill 2"],
      "expectedOutput": "expected phase output"
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "focus": "Week focus",
      "practiceTasks": ["task 1", "task 2"],
      "smallDeliverables": ["deliverable 1", "deliverable 2"]
    }
  ],
  "dailyPlan": {
    "learning": "Specific learning time split activity",
    "practice": "Practice activity",
    "revision": "Revision activity"
  },
  "projects": [
    {
      "title": "Project Title",
      "techStack": ["tech 1", "tech 2"],
      "applicationDemonstration": "What it demonstrates"
    }
  ],
  "progressMetrics": {
    "problemsToSolve": 100,
    "projectsToComplete": 4,
    "skillsToAchieve": 10
  }
}

RULES:
1. Provide a comprehensive sequential journey mapping all the way to expert level for the Target Role.
2. Ensure the timeline fits exactly within the Time Available (${timeAvailableMonths} months).
3. Ensure Daily Plan aligns with ${dailyStudyHours} hours available daily.
4. Avoid vague terms like 'learn basics'. Quantify wherever possible. Prioritize depth.
5. Limit the number of sub-items across 'focusAreas' and 'skillsToLearn' inside each Phase to a MAXIMUM of 5 to 7 items total to prevent overload.
DO NOT include markdown codeblocks (like \`\`\`json). Just the raw JSON object.`;

  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      let rawText = response.text;
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      return JSON.parse(rawText.trim());
    } catch (error) {
      attempt++;
      console.error(`Gemini API Error (Attempt ${attempt}):`, error);
      if (attempt >= maxRetries) {
        throw new Error('Failed to generate AI roadmap due to high API demand. Please wait a moment and try again.');
      }
      // Wait for 3 seconds before retrying
      await new Promise(res => setTimeout(res, 3000));
    }
  }
};
