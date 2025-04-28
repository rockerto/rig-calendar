import { google } from "googleapis";

const bookAppointment = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { date, time, patient } = req.body; // espera: { date: '2025-04-14', time: '15:00', patient: { name, rut, phone, email } }

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CLIENT_SECRET_JSON);
    const token = JSON.parse(process.env.GOOGLE_TOKEN_JSON);

    const auth = new google.auth.OAuth2(
      credentials.web.client_id,
      credentials.web.client_secret,
      credentials.web.redirect_uris[0]
    );

    auth.setCredentials(token);

    const calendar = google.calendar({ version: "v3", auth });

    const startDateTime = new Date(`${date}T${time}:00-04:00`); // Chile horario
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + 30);

    const event = {
      summary: `Sesión Quiropráctica - ${patient.name}`,
      description: `RUT: ${patient.rut}\nTel: ${patient.phone}\nCorreo: ${patient.email}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/Santiago",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/Santiago",
      },
      attendees: [{ email: patient.email }],
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    return res.status(200).json({ success: true, event: response.data });
  } catch (error) {
    console.error("Error creando evento en Google Calendar:", error);
    return res.status(500).json({ error: "No se pudo agendar la hora" });
  }
};

export default bookAppointment;
