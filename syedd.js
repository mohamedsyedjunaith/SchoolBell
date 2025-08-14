const express = require('express');
const app = express();
const PORT = 4000;

app.get('/current-period', (req, res) => {
  res.json({ message: "✅ Current Period endpoint works!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
