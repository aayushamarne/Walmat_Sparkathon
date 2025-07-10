export async function POST(req) {
  try {
    const { text, sourceLang, targetLang } = await req.json();

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );

    const data = await response.json();
    const translated = data.responseData.translatedText;

    return new Response(
      JSON.stringify({ translatedText: translated }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Translation failed:", err.message);
    return new Response(
      JSON.stringify({ error: "Translation failed", details: err.message }),
      { status: 500 }
    );
  }
}
