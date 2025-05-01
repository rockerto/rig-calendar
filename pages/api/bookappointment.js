import { google } from "googleapis";

const bookAppointment = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { date, time, patient } = req.body;

  // Validación extra: detectar si la fecha coincide con el día de la semana que dice el usuario
  const today = new Date();
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.toLocaleDateString("es-CL", { weekday: "long" });

  // Evitar agendar días pasados
  if (appointmentDate < today.setHours(0, 0, 0, 0)) {
    return res.status(400).json({
      error: `No se puede agendar una cita en una fecha pasada (${date}).`
    });
  }

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

    const startDateTime = new Date(`${date}T${time}:00-04:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + 30);

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

    return res.status(200).json({
      success: true,
      event: response.data,
      message: `Evento creado para el ${dayOfWeek} ${date} a las ${time} hrs.`,
    });

  } catch (error) {
    console.error("Error creando evento en Google Calendar:", error);
    return res.status(500).json({ error: "No se pudo agendar la hora" });
  }
};

export default bookAppointment;
