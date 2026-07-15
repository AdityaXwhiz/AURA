require("dotenv").config();

async function main() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );

  const json = await res.json();

  console.log(JSON.stringify(json, null, 2));
}

main();