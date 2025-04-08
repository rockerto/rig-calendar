
const { google } = require("googleapis");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { start_date, end_date } = req.body;

  // Simulación de respuesta
  return res.status(200).json({
    success: true,
    availableAppointments: [
      { date: start_date, time: "10:00" },
      { date: start_date, time: "16:00" }
    ]
  });
}
