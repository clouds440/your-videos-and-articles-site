const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '..', 'data.json');

function readData() {
  const rawData = fs.readFileSync(dataFilePath);
  return JSON.parse(rawData);
}

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = readData();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read data' });
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      writeData(data);
      res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
