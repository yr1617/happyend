// chat.js 맨 위에 추가
const fetch = require('node-fetch');

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
        maxOutputTokens: 150
      }
    };

    if (systemInstructionText) {
      payload.systemInstruction = {
        parts: [{ text: systemInstructionText }]
      };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`;

    // Netlify 504 타임아웃 방지를 위한 15초 강제 타임아웃 제어
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let apiRes;
    try {
      apiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'AbortError') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            choices: [{ message: { content: "응답 시간이 너무 오래 걸려 요청을 취소했습니다. 다시 시도해 주세요." } }]
          })
        };
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error("Gemini Error:", data);
      
      const errorMessage = data.error?.code === 503 
        ? "현재 구글 서버 접속량이 너무 많습니다. 잠시 후 다시 시도해주세요."
        : `오류가 발생했습니다: ${data.error?.message || "Gemini API 오류"}`;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          choices: [{ message: { content: errorMessage } }]
        })
      };
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 가져오지 못했습니다.";

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
        choices: [{ message: { content: `서버 통신 오류: ${error.message}` } }]
      })
    };
  }
};
