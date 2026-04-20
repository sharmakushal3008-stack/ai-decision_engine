// A baseline conditional heuristic processor
exports.evaluateRules = (profile) => {
  const { skills, interests, experienceLevel } = profile;
  
  let baseSuggestions = [];
  const skillsStr = skills.join(' ').toLowerCase();
  const interestsStr = interests.join(' ').toLowerCase();

  // Expanded Rule 1: Web Development
  if (skillsStr.includes('javascript') || skillsStr.includes('react') || skillsStr.includes('node') || interestsStr.includes('web')) {
    baseSuggestions.push("Full-Stack Web Developer", "Frontend Architect", "Backend Systems Engineer");
    if (interestsStr.includes('ai') || interestsStr.includes('machine learning')) {
      baseSuggestions.push("AI Web Engineer", "LLM Integration Specialist");
    }
  }

  // Expanded Rule 2: Data & AI
  if (skillsStr.includes('python') || interestsStr.includes('data') || interestsStr.includes('ai') || interestsStr.includes('machine learning')) {
    baseSuggestions.push(experienceLevel === 'Beginner' ? "Junior Data Analyst" : "Machine Learning Engineer");
    baseSuggestions.push("Data Architect", "AI Research Scientist", "Data Engineer");
  }

  // Expanded Rule 3: Design
  if (skillsStr.includes('design') || interestsStr.includes('ux') || interestsStr.includes('ui')) {
    baseSuggestions.push("UI/UX Designer", "Product Designer", "Interaction Developer");
  }

  // Add general fallbacks to guarantee 5-6 options
  baseSuggestions.push("Software Developer", "Technical Product Manager", "Developer Advocate");

  // Keep unique and slice top 6
  return [...new Set(baseSuggestions)].slice(0, 6);
};
