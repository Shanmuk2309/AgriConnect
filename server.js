const express = require('express');
const { connectDB } = require('./db');
const port = 5500;

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy' });
});


if (require.main === module) {
    connectDB().then(() => {
        app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        });
    });
}

module.exports = app;