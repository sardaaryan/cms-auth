export default function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo user',
  });

  res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
}
