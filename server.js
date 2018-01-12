/*********************************************************************************
* WEB322 – Assignment 08
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this
* assignment has been copied manually or electronically from any other source (including web sites) or
* distributed to other students.
*
* Name: __Yuansheng Lu__ Student ID: _136654167_ Date: __2017-12-25___
*
* Online (Heroku) Link: https://still-beach-55514.herokuapp.com/
*
********************************************************************************/

const dataServiceAuth = require("./data-service-auth.js");
const dataServiceComments = require("./data-service-comments.js");
var data_service = require("./data-service.js");
var path = require("path");
var express = require("express");
var app = express();
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const clientSessions = require("client-sessions");

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public')); // load static file (CSS, js, images)

app.use(bodyParser.urlencoded({ extended: true }));
app.engine(".hbs", exphbs({
  extname: ".hbs",
  defaultLayout: 'layout',
  helpers: {
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));
app.set("view engine", ".hbs");

app.use(bodyParser.json()); // for AJAX (JSON body parser)

app.use(clientSessions({
  cookieName: "session",
  secret: "project_web322",
  duration: 20 * 60 * 1000, // 20 minutes duration
  activeDuration: 1000 * 60
}));
// custom middleware function
// ensure all of templates will have access to a "session" object (used in layout.hbs)
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

// helper middleware function that checks if a user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
   //res.sendFile(path.join(__dirname + "/views/home.html" ));
   res.render("home");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
   //res.sendFile(path.join(__dirname + "/views/about.html" ));
  dataServiceComments.getAllComments()
  .then(function(commentData) {
    res.render("about", {data: commentData});
   })
  .catch(function(err) {
    res.render("about");
  });
});

// setup another route to listen on /employees
app.get("/employees", ensureLogin, function(req,res){
  if (req.query.status) {
    //res.send("status here");
    data_service.getEmployeesByStatus(req.query.status).then(function(data){
      //res.json(data);
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch(function(err){
      //res.json({message: err});
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  } else if (req.query.department) {
    //res.send("department here");
    data_service.getEmployeesByDepartment(req.query.department).then(function(data){
      //res.json(data);
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch(function(err){
      //res.json({message: err});
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  } else if (req.query.manager) {
    //res.send("mamager here");
    data_service.getEmployeesByManager(req.query.manager).then(function(data){
      //res.json(data);
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch(function(err){
      //res.json({message: err});
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  } else {
    //res.send("all employees here");;
    data_service.getAllEmployees().then(function(data){
      //res.json(data);
      res.render("employeeList", { data: data, title: "Employees" });
    }).catch(function(err){
      //res.json({message: err});
      res.render("employeeList", { data: {}, title: "Employees" });
    });
  }
});

// setup another route to listen on /employee/value
app.get("/employee/:num", ensureLogin, function(req,res){
  // initialize an empty object to store the values
  let viewData = {};
  data_service.getEmployeeByNum(req.params.num)
  .then((data) => {
    viewData.data = data; //store employee data in the "viewData" object as "data"
  }).catch(()=>{
    viewData.data = null; // set employee to null if there was an error
  }).then(data_service.getDepartments)
  .then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"
    for (let i = 0; i < viewData.departments.length; i++) {
      if (viewData.departments[i].departmentId == viewData.data.department) {
        viewData.departments[i].selected = true; // add a "selected" property to the matching
      }
    }
  }).catch(()=>{
    viewData.departments=[]; // set departments to empty if there was an error
  }).then(()=>{
    if(viewData.data == null){ // if no employee - return an error
      res.status(404).send("Employee Not Found");
    }else{
      res.render("employee", { viewData: viewData }); // render the "employee" view
    }
  });
});

// setup another route to listen on /managers
app.get("/managers", ensureLogin, function(req,res){
  //res.send("manager!");
  data_service.getManagers().then(function(data){
    //res.json(data);
    res.render("employeeList", { data: data, title: "Employees (Managers)" });
  }).catch(function(err){
    //res.json({message: err});
    res.render("employeeList", { data: {}, title: "Employees (Managers)" });
  });
});

// setup another route to listen on /departments
app.get("/departments", ensureLogin, function(req,res){
  //res.send("departments!");
  data_service.getDepartments().then(function(data){
    //res.json(data);
    res.render("departmentList", { data: data, title: "Departments" });
  }).catch(function(err){
    //res.json({message: err});
    res.render("departmentList", { data: {}, title: "Departments" });
  });
});

// setup another route to listen on /department/value
app.get("/department/:id", ensureLogin, function(req,res){
  //res.send("value!");
  data_service.getDepartmentById(req.params.id).then(function(data){
    //res.json(data);
    res.render("department", { data: data });
  }).catch(function(err){
    //res.json({message: err});
    res.status(404).send("Department Not Found");
  });
});

// setup another route to listen on /employees/add
app.get("/employees/add", ensureLogin, (req,res) => {
  data_service.getDepartments().then(function(data) {
    res.render("addEmployee", {departments: data});
  }).catch(function(err) {
    res.render("addEmployee", {departments: []});
  });
});

// setup another route to listen on /departments/add
app.get("/departments/add", ensureLogin, (req,res) => {
  res.render("addDepartment");
});

// setup route /employees/add for post method
app.post("/employees/add", ensureLogin, (req, res) => {
  data_service.addEmployee(req.body).then(function() {
    res.redirect("/employees");
  }).catch(function(err){
    console.log(err);
  });
});

// setup route /employee/update for post method
app.post("/employee/update", ensureLogin, (req, res) => {
  data_service.updateEmployee(req.body).then(function() {
    res.redirect("/employees");
  }).catch(function(err){
    console.log(err);
  });
});

// setup route /departments/add for post method
app.post("/departments/add", ensureLogin, (req, res) => {
  data_service.addDepartment(req.body).then(function() {
    res.redirect("/departments");
  }).catch(function(err){
    console.log(err);
  });
});

// setup route /department/update for post method
app.post("/department/update", ensureLogin, (req, res) => {
  data_service.updateDepartment(req.body).then(function() {
    res.redirect("/departments");
  }).catch(function(err){
    console.log(err);
  });
});

// setup route /employee/delete/:num
app.get("/employee/delete/:num", ensureLogin, function(req, res) {
  data_service.deleteEmployeeByNum(req.params.num).then(function() {
    res.redirect("/employees");
  }).catch(function(err) {
    res.status(500).send("Unable to Remove Employee / Employee not found");
  });
});

// setup route /about/addComment for post method
app.post("/about/addComment", function(req, res) {
  dataServiceComments.addComment(req.body)
  .then(function(data) {
    res.redirect("/about");
  })
  .catch(function(err) {
    console.log(err);
    res.redirect("/about");
  });
});

// setup route /about/addReply for post method
app.post("/about/addReply", function(req, res) {
  dataServiceComments.addReply(req.body)
  .then(function() {
    res.redirect("/about");
  })
  .catch(function(err) {
    console.log(err);
    res.redirect("/about");
  });
});

// set up route /login to listen on
app.get("/login", function(req, res) {
  res.render("login.hbs");
});

// set up route /register to listen on
app.get("/register", function(req, res) {
  res.render("register.hbs");
});

// setup route /login for post method
app.post("/login", function(req, res) {
  dataServiceAuth.checkUser(req.body)
  .then(function() {
    // add user to the session
    req.session.user = {
      username: req.body.user
    };
    res.redirect('/employees');
  })
  .catch(function(err) {
    res.render("login.hbs", {errorMessage: err, user: req.body.user});
  });
});

// setup route /register for post method
app.post("/register", function(req, res) {
  dataServiceAuth.registerUser(req.body)
  .then(function() {
    res.render("register.hbs", {successMessage: "User created"});
  })
  .catch(function(err) {
    res.render("register.hbs", {errorMessage: err, user: req.body.user});
  });
});

// set up route /logout to listen on
app.get("/logout", function(req, res) {
  req.session.reset();
  res.redirect('/');
});

// setup route /api/updatePassword for post method
app.post("/api/updatePassword", function(req, res) {
  dataServiceAuth.checkUser({user: req.body.user, password: req.body.currentPassword})
  .then(function() {
    dataServiceAuth.updatePassword(req.body)
    .then(function() {
      res.json({successMessage: "Password changed successfully for user: " + req.body.user});
    })
    .catch(function(err) {
      res.json({errorMessage: err});
    });
  })
  .catch(function(err) {
    res.json({errorMessage: err});
  });
});

// setup no matching route
app.use(function(req, res) {
  res.status(404).send("Page Not Found");
});

// load postgres database for data
data_service.initialize()
.then(function() {
  // load the MongoDB database for comments
  dataServiceComments.initialize();
})
.then(function() {
  // load the MongoDB database for authentication
  dataServiceAuth.initialize();
})
.then(function() {
  // setup http server to listen on HTTP_PORT
  app.listen(HTTP_PORT, onHttpStart);
})
.catch(function(err) {
  console.log("Failed to start the sever - " + err);
});
