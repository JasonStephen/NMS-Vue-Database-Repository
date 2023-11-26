// path/to/your/script.js

new Vue({
    el: '#app',
    data: {
        username: '',
        password: ''
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
        }
    }
});



new Vue({
    el: '#registration',
    data: {
      newUser: {
        username: '',
        password: '',
        email: '',
        role: ''
      }
    },
    methods: {
      register() {
        // Make a POST request to your server's register endpoint
        fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.newUser),
        })
        .then(response => {
          if (response.ok) {
            console.log('User registered successfully.');
            // Redirect or perform any action upon successful registration
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
      }
    }
  });