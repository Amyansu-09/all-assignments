const express = require('express');
const app = express();
// const cors = require('cors');

app.use(express.json());
// app.use(cors());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
const adminAuthentication = (req, res, next) => {
  //admin middleware
  const { username, password } = req.headers;
  const admin = ADMINS.find(user => user.username === username && user.password === password);
  if (admin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin authentication failed' });
  }
}

const userAuthentication = (req, res, next) => {
  //user middleware
  const { username, password } = req.headers;
  const user = USERS.find(user => user.username === username && user.password === password);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).json({ message: 'User authentication failed' });
  }
}

app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
 
  const adminExist = ADMINS.find(user => user.username === req.body.username);
  if (adminExist) {
    res.status(403).json({ message: 'Admin already exists' });
  }
  else {
    ADMINS.push(admin);
    res.status(201).json({ message: 'Admin created successfully' });
  }
});

app.post('/admin/login', adminAuthentication, (req, res) => {
  // logic to login admin
  res.json({ message: 'Logged in successfully' });
});

app.post('/admin/courses', adminAuthentication, (req, res) => {
  // logic to create a course
  const id = Math.floor(Math.random() * 1000000);
  const course = {
    id: id,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    imageLink: req.body.link,
    published: req.body.published
  };
  COURSES.push(course);
  res.status(201).json({ message: 'Course created successfully', courseId: course.id })
});

app.put('/admin/courses/:courseId', adminAuthentication, (req, res) => {
  // logic to edit a course
  const course = COURSES.findIndex(course => course.id === parseInt(req.params.courseId));
  if (course === -1) {
    res.status(404).send();
  } else {
    COURSES[course].title = req.body.title;
    COURSES[course].description = req.body.description;
    COURSES[course].price = req.body.price;
    COURSES[course].imageLink = req.body.link;
    COURSES[course].published = req.body.published;
    res.status(201).json({ message: 'Course updated successfully' });
  }
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
  res.json({courses:COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const userExist = USERS.find(user => user.username === req.body.username);
  if (userExist) {
    return res.json({ message: 'username already exist' });
  }
  const newUser = {
    username: req.body.username,
    password: req.body.password,
    purchasedCourses: []
  };
  USERS.push(newUser);
  res.json({ message: 'User created successfully' });
});

app.post('/users/login',userAuthentication, (req, res) => {
  // logic to log in user
  const { username, password } = req.headers;
  const user = USERS.find(user => user.username === username && user.password === password)
  if (user) {
    res.json({ message: 'Logged in successfully' });
  }
  else {
    res.status(401).json({ error: 'Unauthorized - Invalid username or password' });
  }
});

app.get('/users/courses', userAuthentication, (req, res) => {
  // logic to list all courses
  res.json({courses:COURSES});
});

app.post('/users/courses/:courseId', userAuthentication, (req, res) => {
  // logic to purchase a course
  const index = COURSES.findIndex(course => course.id === Number(req.params.courseId))
  if (index === -1) {
    res.status(404).send("No course available");
  } else {
    req.user.purchasedCourses.push(COURSES[index]);
    res.status(201).json({ message: 'Course purchased successfully' });
  }
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
  // logic to view purchased courses
res.json(req.user.purchasedCourses);
});
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
