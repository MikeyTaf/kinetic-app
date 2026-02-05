// Define the shape of the data our functions will work with
export type PRDetailsForScoring = {
  title: string;
  additions: number;
  deletions: number;
  reviews: { body: string }[];
  patches?: { filename: string; status: string; patch: string }[];
};

// Classify PR type based on title and file changes
export function classifyKind(pr: PRDetailsForScoring): "refactor" | "feature" | "bugfix" | "testing" | "devops" | "documentation" {
  const title = pr.title.toLowerCase();
  const files = pr.patches?.map(p => p.filename.toLowerCase()) || [];
  
  // Check files first for stronger signals
  const hasTests = files.some(f => f.includes("test") || f.includes("spec"));
  const hasCI = files.some(f => f.includes(".yml") || f.includes("dockerfile") || f.includes(".yaml"));
  const hasDocs = files.some(f => f.includes("readme") || f.includes(".md") || f.includes("doc"));
  
  if (hasTests && !files.some(f => !f.includes("test") && !f.includes("spec"))) return "testing";
  if (hasCI) return "devops";
  if (hasDocs && files.length <= 2) return "documentation";
  
  // Then check title
  if (title.includes("fix") || title.includes("bug") || title.includes("patch")) return "bugfix";
  if (title.includes("refactor") || title.includes("chore") || title.includes("cleanup") || title.includes("style")) return "refactor";
  if (title.includes("test")) return "testing";
  if (title.includes("doc")) return "documentation";
  
  return "feature";
}

// Craft score based on PR quality signals
export function getCraftScore(pr: PRDetailsForScoring): number {
  let score = 60;
  
  // Size scoring - reward focused PRs
  if (pr.additions < 50) score += 20;
  else if (pr.additions < 150) score += 15;
  else if (pr.additions < 300) score += 5;
  else if (pr.additions > 500) score -= 10;
  else if (pr.additions > 1000) score -= 20;
  
  // Refactors that remove code are valuable
  if (classifyKind(pr) === "refactor" && pr.deletions > pr.additions) {
    score += 15;
  }
  
  // Check for good practices in patches
  if (pr.patches) {
    const allCode = pr.patches.map(p => p.patch).join("\n").toLowerCase();
    
    // Has tests
    if (pr.patches.some(p => p.filename.toLowerCase().includes("test"))) {
      score += 10;
    }
    
    // Has error handling
    if (allCode.includes("try") || allCode.includes("catch") || allCode.includes("throw")) {
      score += 5;
    }
    
    // Has validation
    if (allCode.includes("if") && (allCode.includes("null") || allCode.includes("undefined") || allCode.includes("empty"))) {
      score += 5;
    }
    
    // Has comments/documentation
    if (allCode.includes("/**") || allCode.includes("//")) {
      score += 5;
    }
  }
  
  // Title quality - descriptive titles are better
  if (pr.title.length > 20 && pr.title.length < 80) {
    score += 5;
  }
  
  return Math.max(10, Math.min(100, Math.round(score)));
}

// Collaboration score based on review activity
export function getCollabScore(pr: PRDetailsForScoring): number {
  if (!pr.reviews || pr.reviews.length === 0) {
    return 50; // Neutral baseline
  }
  
  let score = 50;
  
  // Points for review activity
  score += Math.min(pr.reviews.length * 10, 30);
  
  // Bonus for substantive reviews (longer than 50 chars)
  const substantiveReviews = pr.reviews.filter(r => r.body && r.body.length > 50).length;
  score += substantiveReviews * 8;
  
  // Bonus for back-and-forth (multiple reviews)
  if (pr.reviews.length >= 3) {
    score += 10;
  }
  
  return Math.max(10, Math.min(100, Math.round(score)));
}

// New: Velocity score based on PR characteristics
export function getVelocityScore(pr: PRDetailsForScoring): number {
  let score = 70;
  
  // Smaller PRs ship faster
  if (pr.additions < 100) score += 15;
  else if (pr.additions < 250) score += 5;
  else if (pr.additions > 500) score -= 15;
  
  // Focused changes (fewer files) ship faster
  const fileCount = pr.patches?.length || 0;
  if (fileCount <= 3) score += 10;
  else if (fileCount <= 6) score += 5;
  else if (fileCount > 10) score -= 10;
  
  return Math.max(10, Math.min(100, Math.round(score)));
}

// New: Detect skills from code
export function detectSkills(pr: PRDetailsForScoring): string[] {
  const skills: Set<string> = new Set();
  
  if (!pr.patches) return [];
  
  for (const patch of pr.patches) {
    const file = patch.filename.toLowerCase();
    const code = patch.patch.toLowerCase();
    
    // Languages
    if (file.endsWith(".ts") || file.endsWith(".tsx")) skills.add("TypeScript");
    if (file.endsWith(".js") || file.endsWith(".jsx")) skills.add("JavaScript");
    if (file.endsWith(".java")) skills.add("Java");
    if (file.endsWith(".py")) skills.add("Python");
    if (file.endsWith(".go")) skills.add("Go");
    if (file.endsWith(".rs")) skills.add("Rust");
    if (file.endsWith(".rb")) skills.add("Ruby");
    if (file.endsWith(".cs")) skills.add("C#");
    if (file.endsWith(".cpp") || file.endsWith(".c")) skills.add("C/C++");
    
    // Frameworks & tools
    if (code.includes("react") || file.includes(".jsx") || file.includes(".tsx")) skills.add("React");
    if (code.includes("next") || file.includes("next.config")) skills.add("Next.js");
    if (code.includes("express") || code.includes("fastify")) skills.add("Node.js");
    if (file.includes("dockerfile")) skills.add("Docker");
    if (file.includes(".yml") || file.includes(".yaml")) skills.add("CI/CD");
    if (code.includes("sql") || code.includes("query")) skills.add("SQL");
    if (code.includes("mongodb") || code.includes("mongoose")) skills.add("MongoDB");
    if (code.includes("prisma")) skills.add("Prisma");
    
    // Practices
    if (file.includes("test") || file.includes("spec")) skills.add("Testing");
    if (code.includes("async") || code.includes("await") || code.includes("promise")) skills.add("Async Programming");
    if (code.includes("api") || code.includes("fetch") || code.includes("axios")) skills.add("API Integration");
  }
  
  return Array.from(skills).slice(0, 8);
}

// New: Calculate overall "proof strength" 
export function getProofStrength(pr: PRDetailsForScoring): { score: number; tier: "bronze" | "silver" | "gold" | "platinum" } {
  const craft = getCraftScore(pr);
  const collab = getCollabScore(pr);
  const velocity = getVelocityScore(pr);
  
  const avgScore = Math.round((craft + collab + velocity) / 3);
  
  let tier: "bronze" | "silver" | "gold" | "platinum";
  if (avgScore >= 85) tier = "platinum";
  else if (avgScore >= 70) tier = "gold";
  else if (avgScore >= 55) tier = "silver";
  else tier = "bronze";
  
  return { score: avgScore, tier };
}