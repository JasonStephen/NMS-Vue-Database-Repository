const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 用户数据的文件路径
const userFilePath = '../csv/user.csv';
const userData = [];

// 读取用户数据
fs.createReadStream(userFilePath)
  .pipe(csv())
  .on('data', (row) => {
    userData.push(row);
  })
  .on('end', () => {
    console.log('User data loaded successfully.');
  });

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

// 用户注册
app.post('/register', (req, res) => {
  const newUser = req.body;

  // 检查用户是否已存在
  const existingUser = userData.find(user => user.Username === newUser.username);
  if (existingUser) {
    res.status(400).json({ error: 'User already exists' });
    return;
  }

  // Add new user to user data
  userData.push(newUser);

  // Update user data file
  updateUserDataFile(() => {
    console.log('User registered successfully.');
    res.json({ success: true });
  });
});

// 用户登录
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 查找用户
  const user = userData.find(user => user.Username === username && user.Password === password);

  if (user) {
    console.log('User logged in successfully.');
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// 保存 CSV 数据
app.post('/save-csv', (req, res) => {
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

// 更新用户数据文件
function updateUserDataFile(callback) {
  const csvHeader = Object.keys(userData[0]).join(',') + '\n';
  const csvString = csvHeader + userData.map(row => Object.values(row).join(',')).join('\n');

  fs.writeFile(userFilePath, csvString, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to user data file:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      callback();
    }
  });
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
