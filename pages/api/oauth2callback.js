// /pages/api/oauth2callback.js

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Missing OAuth code.');
    return;
  }

  // Aquí normalmente intercambiaríamos el "code" por un token de acceso
  // usando GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET.

  res.status(200).send('OAuth callback received. Code: ' + code);
}
