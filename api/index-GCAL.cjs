const { google } = require("googleapis");

const handler = async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { start_date, end_date } = req.body;

  try {
    const { client_id, client_secret, redirect_uris } = JSON.parse(process.env.GOOGLE_CLIENT_SECRET_JSON).installed;
    const token = JSON.parse(process.env.GOOGLE_TOKEN_JSON);

    const auth = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    auth.setCredentials(token);

    const calendar = google.calendar({ version: "v3", auth });

    const events = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(start_date).toISOString(),
        timeMax: new Date(end_date).toISOString(),
        timeZone: "America/Santiago",
        items: [{ id: "primary" }],
      },
    });

    const busyTimes = events.data.calendars["primary"].busy;

    const availableAppointments = [];
    const appointmentTimes = ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];
    const start = new Date(start_date);
    const end = new Date(end_date);

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split("T")[0];
      for (let time of appointmentTimes) {
        const [hour, minute] = time.split(":");
        const startDateTime = new Date(day);
        startDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(endDateTime.getMinutes() + 30);

        const overlap = busyTimes.some(
          (busy) =>
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

module.exports = handler;
