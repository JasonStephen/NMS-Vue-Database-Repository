// path/to/your/script.js

new Vue({
  el: '#app',
  data: {
      username: '',
      password: '',
      newUser: {
          username: '',
          password: '',
          email: '',
          role: ''
      },
      csvData: [] // You need to set or fetch csvData
  },
  mounted() {
      // Fetch csvData or set it in some way
      // For example, you can fetch it from the server or set it from another source
      this.csvData = [
          // ... your CSV data
      ];
  },
  methods: {
      login() {
          // Make a POST request to your server's login endpoint
          fetch('http://localhost:3000/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  username: this.username,
                  password: this.password
              }),
          })
          .then(response => {
              if (response.ok) {
                  console.log('User logged in successfully.');
                  // Redirect or perform any action upon successful login
              } else if (response.status === 401) {
                  alert('Invalid username or password');
              } else {
                  alert('An error occurred. Please try again.');
              }
          })
          .catch(error => {
              console.error('Error during login:', error);
              alert('An error occurred. Please try again.');
          });
      },
      register() {
        // 获取用户数据
        const newUser = {
            username: this.newUser.username,
            password: this.newUser.password,
            email: this.newUser.email,
            role: this.newUser.role
        };

        // 发送注册请求
        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        })
        .then(response => {
            if (response.ok) {
                console.log('User registered successfully.');

                // 更新本地 CSV 文件
                this.updateLocalCSVFile(() => {
                    // 清空注册表单
                    this.newUser = {
                        username: '',
                        password: '',
                        email: '',
                        role: ''
                    };
                });
            } else if (response.status === 400) {
                alert('User already exists');
            } else {
                alert('An error occurred. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            alert('An error occurred. Please try again.');
        });
    },

    // 新增的方法，用于更新本地 CSV 文件
    updateLocalCSVFile(callback) {
        // 获取当前 CSV 数据
        fetch('http://localhost:3000/get-csv')
            .then(response => response.json())
            .then(csvData => {
                // 添加新用户的数据到 CSV 数据中
                csvData.push({
                    Username: this.newUser.username,
                    ID: csvData.length > 0 ? csvData[csvData.length - 1].ID + 1 : 1,
                    Email: this.newUser.email,
                    Password: this.newUser.password,
                    Role: this.newUser.role
                });

                // 发送更新 CSV 数据请求
                fetch('http://localhost:3000/save-csv', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(csvData),
                })
                .then(response => {
                    if (response.ok) {
                        console.log('CSV file updated successfully.');
                        callback(); // 执行回调函数
                    } else {
                        console.error('Error updating CSV file.');
                        alert('An error occurred. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error updating CSV file:', error);
                    alert('An error occurred. Please try again.');
                });
            })
            .catch(error => {
                console.error('Error fetching CSV data:', error);
                alert('An error occurred. Please try again.');
            });
    }
  }
});
