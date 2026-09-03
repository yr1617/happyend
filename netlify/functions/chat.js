const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Netlify 환경변수에 GEMINI_API_KEY가 설정되지 않았습니다." })
    };
  }

  try {
    const { messages } = JSON.parse(event.body || '{}');

    // OpenAI 형식의 messages 배열을 Gemini API의 systemInstruction 및 contents 형식으로 변환
    let systemInstructionText = "";
    const contents = [];

    messages.forEach(msg => {
      if (msg.role === "system") {
        systemInstructionText += (systemInstructionText ? "\n" : "") + msg.content;
      } else if (msg.role === "user") {
        contents.push({
          role: "user",
          parts: [{ text: msg.content }]
        });
      } else if (msg.role === "assistant") {
        contents.push({
          role: "model",
          parts: [{ text: msg.content }]
        });
      }
    });

    const postData = JSON.stringify({
      systemInstruction: systemInstructionText ? {
        parts: [{ text: systemInstructionText }]
      } : undefined,
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 350
      }
    });

    return new Promise((resolve) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode !== 200) {
            console.error("Gemini API Error:", res.statusCode, data);
            resolve({
              statusCode: res.statusCode,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ error: `Gemini API 오류 (${res.statusCode})` })
            });
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const replyText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 생성하지 못했습니다.";

            // script.js가 인식할 수 있는 OpenAI 형태로 가공해서 반환
            resolve({
              statusCode: 200,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                choices: [
                  {
                    message: {
                      content: replyText
                    }
                  }
                ]
              })
            });
          } catch (e) {
            resolve({
              statusCode: 500,
              body: JSON.stringify({ error: "Gemini 응답 파싱 실패" })
            });
          }
        });
      });

      req.on('error', (e) => {
        console.error("HTTP Request Error:", e);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: e.message })
        });
      });

      req.write(postData);
      req.end();
    });

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
