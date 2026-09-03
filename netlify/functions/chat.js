const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  return new Promise((resolve) => {
    try {
      const { messages } = JSON.parse(event.body);

      const postData = JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 350
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: { "Content-Type": "application/json" },
            body: data
          });
        });
      });

      req.on('error', (e) => {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: e.message })
        });
      });

      req.write(postData);
      req.end();

    } catch (error) {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      });
    }
  });
};\
