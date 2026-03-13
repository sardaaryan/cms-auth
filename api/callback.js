export default async function handler(req, res) {
  const { code } = req.query; // GitHub sends this in the URL
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  try {
    // 1. Swap the temporary code for a permanent access token behind the scenes
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // We want the response in JSON format
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('GitHub did not return an access token.');
    }

    // 2. The "PostMessage" Magic
    // Decap CMS opens this login flow in a popup window. 
    // To get the token back to your main website, we inject a tiny HTML script 
    // that uses window.opener.postMessage to "shout" the token back to the parent window.
    const script = `
      <script>
        const receiveMessage = (message) => {
          // Send the token back to Decap CMS in the exact format it expects
          window.opener.postMessage(
            'authorization:github:success:{"token":"${accessToken}","provider":"github"}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);
        
        // Tell the Decap CMS parent window that we are ready to receive the origin message
        window.opener.postMessage("authorizing:github", "*");
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(script);

  } catch (error) {
    console.error('OAuth Error:', error);
    res.status(500).send('Authentication failed.');
  }
}