// api/webhook.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verificado por Meta');
      return res.status(200).send(challenge);
    } else {
      console.warn('❌ Falló la verificación');
      return res.sendStatus(403);
    }
  }

  if (req.method === 'POST') {
    console.log('📥 Mensaje recibido desde WhatsApp:', JSON.stringify(req.body, null, 2));
    // Aquí podrías procesar el mensaje y hacer que Rigbot responda
    return res.sendStatus(200);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Método ${req.method} no permitido`);
}
