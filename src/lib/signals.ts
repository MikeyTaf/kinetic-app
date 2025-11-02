// Define the shape of the data our functions will work with
export type PRDetailsForScoring = {
  title: string;
  additions: number;
  deletions: number;
  reviews: { body: string }[];
};

// A simple function to guess the type of PR based on its title
export function classifyKind(pr: PRDetailsForScoring): "refactor" | "feature" | "bugfix" {
  const title = pr.title.toLowerCase();
  if (title.includes("fix") || title.includes("bug")) return "bugfix";
  if (title.includes("refactor") || title.includes("chore") || title.includes("style")) return "refactor";
  return "feature";
}

// **IMPROVED SCORING LOGIC**
export function getCraftScore(pr: PRDetailsForScoring): number {
  let score = 70; // Start with a higher base for "good" PRs
  
  // Reward small, focused PRs
  if (pr.additions < 50) score += 15;
  if (pr.additions < 200) score += 5;
  
  // Penalize very large PRs
  if (pr.additions > 800) score -= 25;
  
  // Reward refactors that clean up more code than they add
  if (classifyKind(pr) === 'refactor' && pr.deletions > pr.additions) {
    score += 10;
  }
  
  return Math.max(10, Math.min(100, Math.round(score))); // Clamp between 10 and 100
}

// **IMPROVED SCORING LOGIC**
export function getCollabScore(pr: PRDetailsForScoring): number {
  // If there are no reviews or comments, the score is a neutral 50.
  if (!pr.reviews || pr.reviews.length === 0) {
    return 50;
  }
  
  let score = 50;
  
  // Give points for each review or comment
  score += pr.reviews.length * 15;
  
  // Bonus for "helpful" interactions (longer than 50 characters)
  const helpfulReviews = pr.reviews.filter((r: { body: string }) => r.body && r.body.length > 50).length;
  score += helpfulReviews * 10;
  
  return Math.max(10, Math.min(100, Math.round(score))); // Clamp between 10 and 100
}