export default function handler(req, res) {
  const clientId = process.env.OAUTH_CLIENT_ID;
  
  // We ask GitHub for 'repo' (to commit files) and 'user' (to read their email/profile)
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user`;
  
  // Redirect the user to GitHub
  res.redirect(302, githubAuthUrl);
}