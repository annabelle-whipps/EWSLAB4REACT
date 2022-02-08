///////////////////////////////////////////////////////////////////
// load the express package and create our app
var express = require('express');
var app     = express();
const PORT = process.env.PORT || 8080;
const DBURI = process.env.DBURI || "mongodb://127.0.0.1:27017"

const MongoClient = require('mongodb').MongoClient;
const uri = DBURI;

// This is for using a local db using mongodb community edition.
// To use the (local) community edition, download the apps from https://www.mongodb.com/try/download/community
// You will need to either add the files in bin to your path or otherwise access them.
// Create a directory for your database to live in.
// From a cmdline, use
// ./mongod --dbpath ../data/db
// Where you replace ../data/db with the path to your database (if it's in your path, you might use mongod without the ./).
// This will start a database that you can access with the following uri (which should be an environment variable):
//const uri = "mongodb://127.0.0.1:27017";
// Run the server and add some stuff to the database.
// use
// ./mongo 127.0.0.1:27017 // (assuming you're using the default port)
// from inside the mongo shell, use the following commands to find your database and view the contents
// show dbs
// use mydb //(replace mydb with your database name)
// show collections
// db.myCollection.find()
// This will show you the JSON contents of your collection and will verify that your input was written.
// MongoAtlas has the same sort of set up, but it's a nice http interface
// Manohar's answer: https://stackoverflow.com/questions/5900792/how-to-view-document-fields-in-mongo-shell
// https://docs.mongodb.com/manual/reference/mongo-shell/
//


app.route('/login')
  // show the form (GET http://localhost:PORT/login)
    .get(function(req, res) {       var output = 'getting the login! ';
      var input1 = req.query['input1'];
      var input2 = req.query['input2'];
      if (typeof input1 != 'undefined' && typeof input2 != 'undefined') {
        output+=('There was input: ' + input1 + ' and ' + input2);
        res.send(output);
     }
     console.log('Start the database stuff');

     MongoClient.connect(uri, function (err, db) {
            if(err) throw err;
            console.log('Start the database stuff');
            //Write databse Insert/Update/Query code here..
            var dbo = db.db("mydb");
            var myobj = { firstInput: input1, secondInput: input2 };
            dbo.collection("users").insertOne(myobj, function(err, res) {
              if (err) throw err;
              console.log("1 user inserted");
              db.close();
            });
            console.log('End the database stuff');
     });

    })
  // process the form (POST http://localhost:PORT/login)
    .post(function(req, res) { console.log('processing');
    res.send('processing the login form!');
    });


///////////// The todo stuff
app.use("/todo", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

    app.route('/todo')
      // process (POST http://localhost:PORT/todo) - add it to database
        .post(function(req, res) { 
          var output = 'posting a todo item! ';
          var input1 = req.query['input1'];
          var input2 = req.query['input2'];
          if (typeof input1 != 'undefined' && typeof input2 != 'undefined') {
            output+=('There was input: ' + input1 + ' and ' + input2);
            res.send(output);
          }
          console.log('Start the database writing stuff');
          // const client = new MongoClient(uri);

          MongoClient.connect(uri, function (err, db) {
                 if(err) {
                   res.send('Mongo error!');
                   throw err;
                 }
                 console.log('Start the database stuff');
                 //Write databse Insert/Update/Query code here..
                 var dbo = db.db("mydb");
                 var myobj = { todoNumber: input1, todoText: input2 };
                 dbo.collection("todo").insertOne(myobj, function(err, res) {
                   if (err) throw err;
                   console.log("1 todo item inserted");
                   db.close();
                 });
                 console.log('End the database stuff');
          });
        })

        // process (GET http://localhost:PORT/todo)
        .get(function(req, res) { console.log('processing');
          var numitems = req.query['numitems'];
          if (typeof numitems == 'undefined') {
            numitems = 10;
          }
          console.log('Start the database reading stuff');

          MongoClient.connect(uri, {useNewUrlParser: true}, function (err, db) {
                 if(err) {
                   res.send('Mongo error!');
                   throw err;
                 }
                 //Query databse
                 var dbo = db.db("mydb");
                 // from https://docs.mongodb.com/drivers/node/current/usage-examples/find/
                 // query for only the first 10 todo items
                const query = {};

                const options = {
                  // sort returned documents in ascending order by title (A->Z)
                  sort: { todoNumber: 1 },
                  projection: { todoNumber: 1, todoText: 1 },
                };
                dbo.collection("todo").find(query, options).toArray(function(err, cursor) {
                  if (err) throw err;
                  console.log("items retreived");
                  console.log(cursor);


                  //if ( cursor.count() === 0) {
                  //  console.log("No documents found!");
                  //}

                  cursor.forEach(console.dir);
                  console.log('End the database stuff');
                  res.send(cursor);
                  db.close();
                });

          });
        })

        // process (DELETE http://localhost:PORT/todo)
        .delete(function(req, res) { console.log('deleting');
          console.log('Start the database deleting stuff');

          MongoClient.connect(uri, {useNewUrlParser: true}, function (err, db) {
                 if(err) {
                   res.send('Mongo error!');
                   throw err;
                 }
                 //Query databse
                 var dbo = db.db("mydb");
                 // from https://docs.mongodb.com/drivers/node/current/usage-examples/find/
                 // query for only the first 10 todo items
                 const query = {};
                 dbo.collection("todo").deleteMany(query, function(err, response) {
                  if (err) throw err;
                  console.log("items deleted");
                  res.send("deleted database collection");
                  db.close();
                });

          });
        });

app.use("/todo", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// send our index.html file to the user for the home page
app.get('/', function(req, res) {
     res.sendFile(__dirname + '/userInputTodo.html');
});

///////////////////////////////////////////////////////////////////
// create routes for the admin section
//get an instance of the router
var adminRouter = express.Router(); 
///////////////////////////////////////////////////////////////////
// route middleware that will happen on every request
  adminRouter.use(function(req, res, next) {
    // log each request to the console
    console.log(req.method, req.url);
    console.log("Its middleware!!!");
    // continue doing what we were doing and go to the route
    next(); });
///////////////////////////////////////////////////////////////////


// admin main page. the dashboard (http://localhost:PORT/admin) 
adminRouter.get('/', function(req, res) {
  res.send('I am the dashboard!');  });
// users page (http://localhost:PORT/admin/users) 
adminRouter.get('/users', function(req, res) {
  res.send('I show all the users!');  });

// route middleware to validate :name 
adminRouter.param('name', function(req, res, next, name) {   // do validation on name here   // log something so we know its working 
  console.log('doing name validations on ' + name);   // once validation is done save the new item in the req   req.name = name;   // go to the next thing    next(); 
});


// route with parameters (http://localhost:PORT/admin/users/:name)
adminRouter.get('/users/:name', function(req, res) {   res.send('hello ' + req.params.name + '!');  }); 

// posts page (http://localhost:PORT/admin/posts) 
adminRouter.get('/posts', function(req, res) {
  res.send('I show all the posts!');  });


// apply the routes to our application
app.use('/admin', adminRouter);
///////////////////////////////////////////////////////////////////


// start the server
app.listen(PORT);
console.log('Express Server running at http://127.0.0.1:'+PORT);
///////////////////////////////////////////////////////////////////
