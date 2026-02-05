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
  const truncatedPatches = data.patches.slice(0, 5).map((p) => ({
    filename: p.filename,
    patch: p.patch.slice(0, 3000),
  }));

  const prompt = `Analyze this GitHub Pull Request and provide insights for a developer portfolio.

PR Title: ${data.title}
Lines Added: ${data.additions}
Lines Deleted: ${data.deletions}

Code Changes:
${truncatedPatches.map((p) => `--- ${p.filename} ---\n${p.patch}`).join("\n\n")}

Respond in JSON format only (no markdown, no code blocks, no explanation):
{
  "summary": "2-3 sentence plain English explanation of what this PR does",
  "impactStatement": "1 sentence describing the business/technical impact, starting with a verb (e.g., 'Improved...', 'Added...', 'Fixed...')",
  "skills": ["array", "of", "3-5", "technical", "skills", "demonstrated"],
  "complexity": "low or medium or high",
  "category": "one of: feature, bugfix, refactor, testing, devops, documentation"
}`;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.log("No GROQ_API_KEY found, using fallback analysis");
    return generateFallback(data);
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${response.status} ${err}`);
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PRAnalysis;
    }

    throw new Error("No JSON found in response");
  } catch (error) {
    console.error("AI analysis failed:", error);
    return generateFallback(data);
  }
}

function generateFallback(data: {
  title: string;
  patches: { filename: string; patch: string }[];
  additions: number;
  deletions: number;
}): PRAnalysis {
  const skills = detectSkillsFromFiles(data.patches.map((p) => p.filename));
  const category = guessCategory(data.title);
  const complexity = data.additions > 200 ? "high" : data.additions > 50 ? "medium" : "low";

  const hasTests = data.patches.some((p) => p.filename.toLowerCase().includes("test"));
  const hasConfig = data.patches.some((p) => p.filename.includes(".yml") || p.filename.includes(".json"));

  let summary = `This PR "${data.title}" modifies ${data.patches.length} file(s)`;
  if (hasTests) summary += " including test coverage";
  if (hasConfig) summary += " with configuration updates";
  summary += ` (+${data.additions}/-${data.deletions} lines).`;

  const impactPhrases: Record<string, string> = {
    feature: `Added new functionality with ${data.additions} lines of implementation code.`,
    bugfix: `Fixed issues improving code reliability and stability.`,
    refactor: `Improved code quality ${data.deletions > data.additions ? "by removing " + (data.deletions - data.additions) + " lines of technical debt" : "through restructuring"}.`,
    testing: `Enhanced test coverage to ensure code reliability.`,
    devops: `Improved deployment and infrastructure configuration.`,
    documentation: `Enhanced project documentation for better maintainability.`,
  };

  return {
    summary,
    impactStatement: impactPhrases[category] || `Updated codebase with ${data.additions} lines of new code.`,
    skills: skills.length > 0 ? skills : ["Software Development"],
    complexity,
    category,
  };
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