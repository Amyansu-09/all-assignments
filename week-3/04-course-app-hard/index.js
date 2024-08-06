const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Define mongoose schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean
});

// Define mongoose model
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);
// Connect to MongoDB
mongoose.connect('mongodb+srv://amyansu:Amyansu_09++@cluster0.cgr16nu.mongodb.net/courses');

//Secret key
const secretKey = 'secret1.0';
//Adminauthentication token
const adminAuthenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403)
      }
      else {
      req.user = user;
      next();
      }
    })
  }
  else {
    res.status(403).json({ message: 'Admin authentication failed' });
  }
}

//Secret key2
const secretKey2 = 'secret2.0';
//User AuthenticateJwt
const userAuthenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey2, (err, user) => {
      if (err) {
        return res.status(403)
      }
      else {
        req.user = user;
        next();
        }
    })
  }
  else {
    res.status(403).json({ message: 'User authentication failed' });
  }
}

// Admin routes
app.get('/admin/me', adminAuthenticateJwt, (req, res) => {
   res.json({
    username: req.user.username
   })
});

app.post('/admin/signup', async (req, res) => {
  // logic to sign up admin
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin) {
    res.status(403).json({ message: 'Admin already exists' });
  }
  else {
    const obj = ({username:username, password:password})
    const newAdmin = new Admin (obj);
    await newAdmin.save();
    const token = jwt.sign({username, role:'admin'},secretKey, {expiresIn:'1h'});
    res.json({message: 'Admin created successfully', token});
  }
});

app.post('/admin/login', async (req, res) => {
  // logic to log in admin
  const { username, password } = req.headers;
  const admin = await Admin.findOne({username, password});
  if (admin){
    const token = jwt.sign({username, role:'admin'}, secretKey, {expiresIn:'1h'});
    res.json({message: 'Logged in successfully', token})
  }
  else {
    res.status(403).json({message: 'Invalid username or password'})
  }
});

app.post('/admin/courses',adminAuthenticateJwt, async (req, res) => {
  // logic to create a course
  const course = new Course(req.body);
  await course.save();
  res.json({message: 'Course created successfully', courseId: course.id});
});

app.put('/admin/courses/:courseId', adminAuthenticateJwt, async (req, res) => {
  // logic to edit a course
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {new: true});
  if (course){
    res.json({message: 'Course update successfully'});
  }else{
    res.status(404).json({message: 'Course not found'});
  }
});

app.get('/admin/courses', adminAuthenticateJwt, async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({});
  res.json({ courses });
});

// User routes
app.post('/users/signup', async (req, res) => {
  // logic to sign up user
  const {username, password} = req.body;
  const user = await User.findOne({username});
  if (user){
    res.status(403).json({message: 'User already exists'});
  }
  else{
    const newUser = new User({username, password});
    await newUser.save();
    const token = jwt.sign({username, role: 'user'},secretKey2, {expiresIn: '1h'});
    res.json({message: 'User created successfully',token});
  }
});

app.post('/users/login', async (req, res) => {
  // logic to log in user
  const {username, password} = req.headers;
  const user = await User.findOne({username,password});
  if (user){
    const token = jwt.sign({username, role: 'user'}, secretKey2, {expiresIn: '1h'})
    res.json({message: 'Logged in successfully', token});
  }else{
    res.status(403).json({message: 'Invalid username or password'})
  }
});

app.get('/users/courses', userAuthenticateJwt, async (req, res) => {
  // logic to list all courses
  const courses = await Course.find({published:true});
  res.json({courses});
});

app.post('/users/courses/:courseId', userAuthenticateJwt, async (req, res) => {
  // logic to purchase a course
  const course = await Course.findById(req.courseId);
  if (course){
    const user = await User.findOne({ username: req.user.username});
  if (user){
    user.purchasedCourses.push(course);
    await user.save();
    res.json({ message: 'Course purchased successfully', courseid:course._id  });  
  }
  else{
    res.status(403).json({message: 'User not found'});
  }
}
  else{
    res.status(403).json({message: 'Course not found'})
  }
});

app.get('/users/purchasedCourses', userAuthenticateJwt, async (req, res) => {
  // logic to view purchased courses
  const user = await User.findOne({username: req.user.username}).populate('purchasedCourses');
  if(user){
    res.json({ purchasedCourses: user.purchasedCourses || [] })
  }else{
    res.status(403).json({message: 'User not found'})
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
