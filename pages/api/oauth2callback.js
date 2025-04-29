import { google } from 'googleapis';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Missing OAuth code.');
    return;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://rig-calendar.vercel.app/api/oauth2callback'
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.status(200).json({
      message: 'Token recibido exitosamente 🎉',
      tokens
    });

  } catch (error) {
    console.error('Error al intercambiar el código:', error);
    res.status(500).json({
      message: 'Error al intercambiar el código',
      details: error.message,
      full: error.response?.data || 'No se pudo acceder al detalle del error.'
    });
  }
}
