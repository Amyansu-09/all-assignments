const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretKey = 'super1secret0';

const generateJwt = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

const adminAuthenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err){
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

const secretKey2 = 'super1secret2';

const ugenerateJwt = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, secretKey2, { expiresIn: '1h' });
}


const userAuthenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey2, (err, user) => {
      if (err){
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
  const existingAdmin = ADMINS.find(a => a.username === admin.username);
  if (existingAdmin){
    res.status(403).json({ message: 'Admin already exists' });
  }
  else{
    ADMINS.push(admin);
    const token = generateJwt(admin);
    res.status(201).json({ message: 'Admin created successfully', token });
  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  const {username, password} = req.headers;
  console.log(req.headers)
  console.log(ADMINS)
  const admin = ADMINS.find(a => a.username === username && a.password === password);
  console.log(admin)
  if(admin){
    const token = generateJwt(admin);
    res.json({message: "Logged in successfully", token});
  } 
  else{
    res.status(403).json({ message: 'Admin authentication failed' });
  }
});

app.post('/admin/courses', adminAuthenticateJwt, (req, res) => {
  // logic to create a course
  const course = req.body;
  course.id = COURSES.length + 1;
  COURSES.push(course);
  res.json({ message: 'Course created successfully', courseId: course.id });
});

app.put('/admin/courses/:courseId', adminAuthenticateJwt, (req, res) => {
  // logic to edit a course
  console.log(req.body)
  const course = COURSES.findIndex(c => c.id === parseInt(req.params.courseId));
  if (course === -1) {
    res.status(404).send({ message: 'Course not found' });
  } else {
    COURSES[course] = req.body;
    res.status(201).json({ message: 'Course updated successfully' });
  }
});

app.get('/admin/courses', adminAuthenticateJwt, (req, res) => {
  // logic to get all courses
  res.json({ courses: COURSES });
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const newUser = req.body;
  const existingUser = USERS.find(a => a.username === newUser.username);
  if(existingUser){
    res.json("Username already exists");
  }
  else{
    USERS.push({...newUser,purchasedCourses:[]});
    const token = ugenerateJwt(newUser);
    res.status(201).json({message: "User created successfully", token});
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  const {username, password} = req.headers;
  const user = USERS.find(a => a.username === username && a.password === password);
  console.log(user);
  if (user) {
    const token = ugenerateJwt(user);
    res.json({message:"Logged in successfully", token });
  }
});

app.get('/users/courses', userAuthenticateJwt, (req, res) => {
  // logic to list all courses
  res.json({ courses: COURSES });
});

app.post('/users/courses/:courseId', userAuthenticateJwt, (req, res) => {
  // logic to purchase a course
  const course = COURSES.findIndex(a => a.id === parseInt(req.params.courseId));
  if (course == -1){
    res.status(403).json('Course not found')
  }
  else{
    const user = USERS.find(u => u.username === req.user.username);
    user.purchasedCourses.push(COURSES[course]);
    res.json('Course purchased successfully');
  }
});

app.get('/users/purchasedCourses', userAuthenticateJwt, (req, res) => {
  // logic to view purchased courses
  const user = USERS.find(u => u.username === req.user.username);
  res.json(user.purchasedCourses);
});
  
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
