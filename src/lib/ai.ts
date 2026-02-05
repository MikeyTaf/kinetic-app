import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export type PRAnalysis = {
  summary: string;
  impactStatement: string;
  skills: string[];
  complexity: "low" | "medium" | "high";
  category: string;
};

export async function analyzePR(data: {
  title: string;
  patches: { filename: string; patch: string }[];
  additions: number;
  deletions: number;
}): Promise<PRAnalysis> {
  // Truncate patches to avoid token limits (keep first 4000 chars of each)
  const truncatedPatches = data.patches.slice(0, 5).map((p) => ({
    filename: p.filename,
    patch: p.patch.slice(0, 4000),
  }));

  const prompt = `Analyze this GitHub Pull Request and provide insights for a developer portfolio.

PR Title: ${data.title}
Lines Added: ${data.additions}
Lines Deleted: ${data.deletions}

Code Changes:
${truncatedPatches.map((p) => `--- ${p.filename} ---\n${p.patch}`).join("\n\n")}

Respond in JSON format only (no markdown, no code blocks):
{
  "summary": "2-3 sentence plain English explanation of what this PR does",
  "impactStatement": "1 sentence describing the business/technical impact, starting with a verb (e.g., 'Improved...', 'Added...', 'Fixed...')",
  "skills": ["array", "of", "3-5", "technical", "skills", "demonstrated"],
  "complexity": "low or medium or high",
  "category": "one of: feature, bugfix, refactor, testing, devops, documentation"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PRAnalysis;
    }

    throw new Error("No JSON found in response");
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Return fallback analysis
    return {
      summary: `This PR "${data.title}" modifies ${data.patches.length} file(s) with ${data.additions} additions and ${data.deletions} deletions.`,
      impactStatement: `Updated codebase with ${data.additions} lines of new code.`,
      skills: detectSkillsFromFiles(data.patches.map((p) => p.filename)),
      complexity: data.additions > 200 ? "high" : data.additions > 50 ? "medium" : "low",
      category: guessCategory(data.title),
    };
  }
}

function detectSkillsFromFiles(filenames: string[]): string[] {
  const skills: Set<string> = new Set();

  for (const file of filenames) {
    if (file.endsWith(".ts") || file.endsWith(".tsx")) skills.add("TypeScript");
    if (file.endsWith(".js") || file.endsWith(".jsx")) skills.add("JavaScript");
    if (file.endsWith(".java")) skills.add("Java");
    if (file.endsWith(".py")) skills.add("Python");
    if (file.endsWith(".css") || file.endsWith(".scss")) skills.add("CSS");
    if (file.includes("test") || file.includes("spec")) skills.add("Testing");
    if (file.includes("Dockerfile") || file.includes(".yml")) skills.add("DevOps");
    if (file.endsWith(".sql")) skills.add("SQL");
    if (file.includes("api") || file.includes("route")) skills.add("API Development");
  }

  return Array.from(skills).slice(0, 5);
}

function guessCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("fix") || lower.includes("bug")) return "bugfix";
  if (lower.includes("test")) return "testing";
  if (lower.includes("refactor") || lower.includes("clean")) return "refactor";
  if (lower.includes("doc")) return "documentation";
  if (lower.includes("ci") || lower.includes("deploy") || lower.includes("docker")) return "devops";
  return "feature";
}