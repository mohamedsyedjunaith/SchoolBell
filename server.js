const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const os = require('os');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const PORT = 5600;

app.use(cors());
app.use(bodyParser.json());

// ✅ Telegram Bot Setup
const TELEGRAM_BOT_TOKEN = '8348800302:AAEs-fMtwcUebhTTzulFTE3k41MVsmTzbbE'; // Replace with your bot token
const TELEGRAM_CHAT_ID = '2133372506'; // Replace with your chat ID

// 📧 Receiver email
const RECEIVER_EMAIL = "syedjunaith455@gmail.com"; // Replace with actual receiver email

// ✅ Function to send Telegram Message
function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "HTML"
  })
  .then(() => console.log("📩 Telegram message sent"))
  .catch(err => console.error("❌ Telegram send error:", err.response?.data || err.message));
}

// ✅ Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
const localIP = getLocalIP();

// 📧 Gmail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'syedjunaith143@gmail.com',
    pass: 'lzuv jjcw hccf zpro' // Gmail App Password
  }
});

// 📧 Styled Email send function
function sendEmail(subject, message, toEmail) {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; }
          h2 { color: #007bff; }
          .box { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
          .status-absent { color: #b30000; font-weight: bold; }
          .status-substitute { color: #006600; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #007bff; color: white; }
          a { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="box">
          <h2>${subject}</h2>
          <p>${message}</p>
          <p>📄 <a href="http://127.0.0.1:5500/timetable.html" target="_blank">View Full Timetable</a></p>
          <table>
            <tr>
              <th>Period</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Status</th>
            </tr>
            ${timetable.map(row => `
              <tr>
                <td>${row.period}</td>
                <td>${row.time}</td>
                <td>${row.subject}</td>
                <td>${row.teacher}</td>
                <td class="status-${row.status}">${row.status}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: 'syedjunaith143@gmail.com',
    to: toEmail,
    subject: subject,
    text: `${message}\n\nView Full Timetable: http://127.0.0.1:5500/timetable.html`,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email send failed:', error);
    } else {
      console.log(`✅ Email sent: ${info.response}`);
    }
  });
}

// 🔔 Timetable data
let timetable = [
  { period: 1, time: "08:45 - 09:40", subject: "Control System", teacher: "Dr.S.Usha", staffId: "T001", status: "present" },
  { period: 2, time: "09:40 - 10:25", subject: "SIM", teacher: "Mr.S.Chandrasekar", staffId: "T002", status: "present" },
  { period: 3, time: "10:45 - 11:30", subject: "Python", teacher: "Ms.J.Gowthami", staffId: "T003", status: "present" },
  { period: 4, time: "11:30 - 12:15", subject: "TPDE", teacher: "Mr.B.Jeevanandan", staffId: "T004", status: "present" },
  { period: 5, time: "13:15 - 14:00", subject: "MCI", teacher: "Dr.M.Karthik", staffId: "T005", status: "present" },
  { period: 6, time: "14:00 - 14:45", subject: "PST", teacher: "Dr.P.Magudeshwaran", staffId: "T006", status: "present" },
  { period: 7, time: "15:00 - 15:45", subject: "Coding Practice", teacher: "Dr.M.Sivachitra", staffId: "T007", status: "present" },
  { period: 8, time: "15:45 - 16:30", subject: "Mentor", teacher: "Dr.N.Priyadharshini", staffId: "T008", status: "present" },
  { period: 9, time: "16:45 - 08:30", subject: "Testing", teacher: "Syed Junaith", staffId: "T009", status: "present" }
];

// Helper: Get allowed staff IDs from timetable
function getAllowedStaffIds() {
  return [...new Set(timetable.map(p => p.staffId))];
}

// 🕒 Current period API
app.get('/current-period', (req, res) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isCurrentTimeInPeriod = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;
    return start <= end
      ? currentMinutes >= start && currentMinutes < end
      : currentMinutes >= start || currentMinutes < end;
  };

  const currentPeriod = timetable.find(({ time }) => {
    const [startStr, endStr] = time.split(" - ");
    return isCurrentTimeInPeriod(startStr, endStr);
  });

  if (!currentPeriod) {
    return res.json({ period: null, subject: "None", teacher: "None", startTime: "", endTime: "", action: "No bell" });
  }

  const [startStr, endStr] = currentPeriod.time.split(" - ");
  let response = {
    period: currentPeriod.period,
    subject: currentPeriod.subject,
    startTime: startStr,
    endTime: endStr
  };

  if (currentPeriod.status === "absent") {
    response.teacher = "Absent";
    response.action = "Absent";
  } else if (currentPeriod.status === "substitute") {
    response.teacher = currentPeriod.teacher;
    response.action = "Substitute";
  } else {
    response.teacher = currentPeriod.teacher;
    response.action = "Ring bell";
  }
  res.json(response);
});

// 📅 Full timetable
app.get('/timetable', (req, res) => {
  res.json(timetable);
});

// ❌ Mark teacher absent + send email + telegram
app.post('/mark-absent', (req, res) => {
  const { staffId } = req.body;
  if (!getAllowedStaffIds().includes(staffId)) {
    return res.status(400).json({ error: "Invalid staffId" });
  }

  timetable.forEach(row => {
    if (row.staffId === staffId && row.status === "present") {
      row.status = "absent";
      const emailMsg = `Teacher ${row.teacher} (Subject: ${row.subject}, Period: ${row.period}) has been marked absent.`;
      sendEmail(`Teacher Absent: ${row.teacher}`, emailMsg, RECEIVER_EMAIL);
      sendTelegramMessage(`❌ <b>Teacher Absent</b>\n👩‍🏫 ${row.teacher}\n📚 ${row.subject}\n⏰ Period ${row.period}`);
    }
  });
  res.json({ message: "Marked as absent & notifications sent", timetable });
});

// 🔁 Assign substitute + send email + telegram
app.post('/assign-substitute', (req, res) => {
  const { period, newTeacher, newStaffId } = req.body;
  const allowedIds = getAllowedStaffIds();

  if (!allowedIds.includes(newStaffId)) {
    return res.status(400).json({ error: "Invalid substituteStaffId" });
  }

  const row = timetable.find(p => p.period === period);
  if (row && row.status === "absent") {
    row.teacher = newTeacher;
    row.staffId = newStaffId;
    row.status = "substitute";
    const emailMsg = `Substitute Teacher ${newTeacher} is assigned for Subject: ${row.subject}.`;
    sendEmail(`Substitute Assigned for Period ${row.period}`, emailMsg, RECEIVER_EMAIL);
    sendTelegramMessage(`🔄 <b>Substitute Assigned</b>\n👩‍🏫 ${newTeacher}\n📚 ${row.subject}\n⏰ Period ${row.period}`);
  }
  res.json({ message: "Substitute assigned & notifications sent", timetable });
});

// 🌐 Root
app.get('/', (req, res) => {
  res.send("✅ Smart Bell API is running");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://${localIP}:${PORT}`);
});
