const { google } = require("googleapis");

const handler = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { start_date, end_date } = req.body;

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

    const timeMin = new Date(start_date);
    const timeMax = new Date(end_date);
    timeMax.setDate(timeMax.getDate() + 1); // 🔧 IMPORTANTE: incluye el día completo

    const events = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: "America/Santiago",
        items: [{ id: "primary" }],
      },
    });

    const busyTimes = events.data.calendars["primary"].busy;
    const appointmentTimes = [
      "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "15:00", "15:30",
      "16:00", "16:30", "17:00", "17:30"
    ];

    const availableAppointments = [];
    const current = new Date(timeMin);
    const last = new Date(timeMax);

    for (let day = new Date(current); day < last; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split("T")[0];
      for (const time of appointmentTimes) {
        const [hour, minute] = time.split(":").map(Number);
        const startDateTime = new Date(day);
        startDateTime.setHours(hour, minute, 0, 0);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + 30);

        const overlap = busyTimes.some(busy =>
          new Date(busy.start) < endDateTime &&
          new Date(busy.end) > startDateTime
        );

        if (!overlap) {
          availableAppointments.push({ date: dateStr, time });
        }
      }
    }

    res.status(200).json({
      success: true,
      availableAppointments,
    });
  } catch (error) {
    console.error("Error consultando Google Calendar:", error);
    res.status(500).json({ error: "Error consultando Google Calendar" });
  }
};

export default handler;
