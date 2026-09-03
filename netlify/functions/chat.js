exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        choices: [{ message: { content: "GEMINI_API_KEY가 설정되지 않았습니다." } }]
      })
    };
  }

  try {
    const { messages } = JSON.parse(event.body || '{}');

    let systemInstructionText = "";
    const contents = [];

    if (Array.isArray(messages)) {
      messages.forEach(msg => {
        if (msg.role === "system") {
          systemInstructionText += (systemInstructionText ? "\n" : "") + msg.content;
        } else if (msg.role === "user") {
          contents.push({ role: "user", parts: [{ text: msg.content }] });
        } else if (msg.role === "assistant") {
          contents.push({ role: "model", parts: [{ text: msg.content }] });
        }
      });
    }

    const payload = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 350
      }
    };

    if (systemInstructionText) {
      payload.systemInstruction = {
        parts: [{ text: systemInstructionText }]
      };
    }

    // gemini-3.6-flash 유지
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`;
    
    const apiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error("Gemini Error:", data);
      
      const errorMessage = data.error?.code === 503 
        ? "현재 구글 서버 트래픽이 많아 답변이 지연되고 있습니다. 잠시 후 다시 전송해 주세요!"
        : `오류가 발생했습니다: ${data.error?.message || "Gemini API 오류"}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          choices: [{ message: { content: errorMessage } }]
        })
      };
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변 내용을 찾을 수 없습니다.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        choices: [
          {
            message: {
              content: replyText
            }
          }
        ]
      })
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        choices: [{ message: { content: `서버 오류 발생: ${error.message}` } }]
      })
    };
  }
};
