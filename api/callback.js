export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const redirectUri = 'http://localhost:3000/api/callback';

  if (!code) {
    return res.status(400).send('Missing code');
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('GitHub token response:', tokenData);

    if (!tokenData.access_token) {
      return res.status(400).json({
        error: 'No access token returned',
        github_response: tokenData,
      });
    }

    const accessToken = tokenData.access_token;

    const script = `
      <script>
        const receiveMessage = (message) => {
          window.opener.postMessage(
            'authorization:github:success:{"token":"${accessToken}","provider":"github"}',
            message.origin
          );
          window.removeEventListener("message", receiveMessage, false);
          window.close();
        };
        window.addEventListener("message", receiveMessage, false);
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