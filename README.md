# Decap CMS GitHub OAuth Bridge

A lightweight, serverless OAuth bridge deployed on Vercel. This project handles the authentication flow required to log into Decap CMS using a GitHub account.

By default, Decap CMS requires an authentication server to exchange a GitHub OAuth code for an access token. This repository serves as that backend bridge, utilizing Vercel Serverless Functions.

## 🚀 Features

* **Serverless Architecture:** Uses Vercel Serverless Functions (`api/login` and `api/callback`) for zero-maintenance hosting.
* **Access Control:** Includes a security gate that checks the authenticated user's GitHub username against an allowlist, preventing unauthorized users from accessing the CMS dashboard or consuming server execution limits.

## ⚙️ Environment Variables

To run this project successfully, you must configure the following Environment Variables in your Vercel project settings:

| Variable | Description |
| :--- | :--- |
| `OAUTH_CLIENT_ID` | Your GitHub OAuth App Client ID. |
| `OAUTH_CLIENT_SECRET` | Your GitHub OAuth App Client Secret. |
| `ALLOWED_USERS` | A comma-separated list of GitHub usernames allowed to access the CMS (e.g., `IcarusAdmin,JohnDoe,JaneSmith`). If left blank, it defaults to a fallback username specified in the code. |

## 🛠️ GitHub OAuth App Setup

1. Go to your GitHub Developer Settings and create a new OAuth App.
2. **Homepage URL:** Enter the base URL of your deployed Vercel bridge (e.g., `https://your-vercel-bridge.vercel.app`).
3. **Authorization callback URL:** Enter the callback URL for your Vercel bridge (e.g., `https://your-vercel-bridge.vercel.app/api/callback`).
4. Generate a Client Secret and add both the Client ID and Secret to your Vercel Environment Variables.

## 🔗 Connecting to Decap CMS

Once deployed, update the `config.yml` file in your main website's repository (the site where Decap CMS is installed). Set the `base_url` to your Vercel deployment URL.

```yaml
backend:
  name: github
  repo: ICARUSALPHAINC/web-frontend # The repo where your content lives
  branch: production
  base_url: [https://your-vercel-bridge.vercel.app](https://your-vercel-bridge.vercel.app) # THIS project's URL
  auth_endpoint: api/login
```

## 📂 File Structure
* api/login.js: Initiates the OAuth flow and redirects the user to GitHub's authorization page.

* api/callback.js: Handles the response from GitHub, exchanges the code for an access token, verifies the user against ALLOWED_USERS, and passes the token securely back to the Decap CMS window.
