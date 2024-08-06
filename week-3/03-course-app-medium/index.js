const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let ADMINS = [];
let USERS = [];
let COURSES = [];

try {
  let ADMINS = [fs.readFileSync('admins.json', 'utf-8')];
  let USERS = [fs.readFileSync('users.json', 'utf-8')];
  let COURSES = [fs.readFileSync('courses.json', 'utf-8')];
}
catch {
  ADMINS = [];
  USERS = [];
  COURSES = [];
}
console.log(ADMINS);

const secretKey = 'secret0';

const adminAuthenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403)
      }
      req.user = user;
      next();
    })

  }
  else {
    res.status(403).json({ message: 'Admin authentication failed' });
  }
}

const secretKey2 = 'secret1';

const userAuthenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey2, (err, user) => {
      if (err) {
        return res.status(403)
      }
      req.user = user;
      next();
    })
  }
  else {
    res.status(403).json({ message: 'User authentication failed' });
  }
}
// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;
  const existingAdmin = ADMINS.find(u => u.username === username);
  if (existingAdmin){
    res.status(404).json({message:"Username already exists"});
  }else{
    ADMINS.push(admin);
    fs.witeFileSync('admin.json', JSON.stringify(ADMINS));
    const token = jwt.sign({username, role:'admin'}, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Admin created successfully', token });
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  const {username, password} = req.headers;
  const admin = ADMINS.find(u => u.username === username && u.password === password);
  if(admin){
    const token = jwt.sign({username, role:'admin'}, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  }else{
    res.status(403).json({ message: 'Invalid username or password' });
  }
});

app.post('/admin/courses',adminAuthenticateJwt, (req, res) => {
  // logic to create a course
  

});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
