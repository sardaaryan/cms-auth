export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("GitHub token response:", tokenData);
      return res.status(400).json({
        error: "GitHub did not return an access token",
        github_response: tokenData,
      });
    }

    const script = `
      <script>
        (() => {
          if (!window.opener) {
            document.body.innerHTML = "<h1>Authentication completed</h1><p>No opener window was found. Start this flow from Decap CMS, not by opening the login URL directly.</p>";
            return;
          }

          const receiveMessage = (message) => {
            if (!window.opener) return;

            window.opener.postMessage(
              'authorization:github:success:{"token":"${accessToken}","provider":"github"}',
              message.origin
            );

            window.removeEventListener("message", receiveMessage, false);
            window.close();
          };

          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>
    `;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(script);
  } catch (error) {
    console.error("OAuth Error:", error);
    return res.status(500).send("Authentication failed.");
  }
}
