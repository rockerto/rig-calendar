
import { google } from "googleapis";
import { addDays, formatISO } from "date-fns";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { start_date, end_date } = req.body;

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "token.json",
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: "v3", auth: authClient });

    const calendarId = "primary"; // usa el calendario principal de roberto.ibacache@gmail.com

    const events = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(start_date).toISOString(),
        timeMax: new Date(end_date).toISOString(),
        timeZone: "America/Santiago",
        items: [{ id: calendarId }],
      },
    });

    const busyTimes = events.data.calendars[calendarId].busy;

    const availableAppointments = [];

    const start = new Date(start_date);
    const end = new Date(end_date);
    const appointmentTimes = ["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];

    for (
      let day = new Date(start);
      day <= end;
      day.setDate(day.getDate() + 1)
    ) {
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
          availableAppointments.push({
            date: dateStr,
            time,
          });
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
}
