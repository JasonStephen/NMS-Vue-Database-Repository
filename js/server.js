const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// 用于获取 CSV 数据的路由
app.get('/get-csv', (req, res) => {
  const csvData = [];

  fs.createReadStream('../csv/data.csv')  // 请确保路径正确
    .pipe(csv())
    .on('data', (row) => {
      csvData.push(row);
    })
    .on('end', () => {
      res.json(csvData);
    });
});

app.post('/save-csv', express.json(), (req, res) => {
  const updatedCsvData = req.body;

  // 请确保路径正确
  const filePath = '../csv/data.csv';

  // 添加标题行
  const csvHeader = Object.keys(updatedCsvData[0]).join(',') + '\n';

  // 将 updatedCsvData 转换为 CSV 格式字符串
  const csvString = csvHeader + updatedCsvData.map(row => Object.values(row).join(',')).join('\n');

  // 将 CSV 格式字符串写入到文件
  fs.writeFile(filePath, csvString, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to CSV file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      console.log('CSV file updated successfully.');
      res.json({ success: true });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
