//Base Setup
//----------------
//Calling the modules needed
var cors = require('cors');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require("./models/user");
const List = require('./models/list');
var Task = require('./models/task');

mongoose.connect('mongodb+srv://hsnbacha:hsnbacha@cluster0.jjqh9.mongodb.net/test', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}, ()=>{console.log("Connected to Database.")});

//Configuring the app to use body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

//Setting the port
var port = process.env.port || 8080;

//setting our router
var router = express.Router();


//Setting up middleware
router.use(function(req, res, next){
    console.log("Getting Command...");
    next();
});

//test route to make sure everythign is correct
router.get('/', function(req, res) {
    res.json({ message: 'Yes its working...' });   
});



/*--------------------------------------------
=================OUR ROUTERS==================
--------------------------------------------*/



/*
-----------------------------------
Router to register our users
-----------------------------------
*/
router.route('/users/register')
    //Single post request to handle everything
    .post(function(req,res){
        var query = {username: req.query.username};
        //check if the username is taken
        User.findOne(query, function(err, user){
            if(err) res.send(err);
            //Send if a user already exists
            if(user){
                res.status(404).json({message:"username is already taken..."});
            //doesn't exist so create a new user
            }else{
                var user = new User();

                user.username = req.query.username;
                user.password = req.query.password;
                //save the user
                user.save(function(err){
                    if(err) res.send(err);

                    res.status(200).json({ message: 'User created with username: ' +  req.query.username });
                })
            }
        });
});


/*
-----------------------------------
Router to login a user [PERFECTED]
-----------------------------------
*/
router.route('/users/login')
    .get(function(req,res){
        //query to check if the user exists
        var query = {username: req.query.username};
        var password = req.query.password;
        User.findOne(query, function(err, user){
            //if(err) res.send(err);
            //if username or password is wrong, send this message
            if(!user){
                res.status(404).send();
            }else{
                if(user.password != password){
                    res.status(404).send();
                }else{
                    res.json(user);
                }
            }
        });
});


/*
-----------------------------------
Router to get Lists of a user, and make a new list
-----------------------------------
*/
router.route('/users/lists/:user_id')
    .get(function(req, res){
        var query = { userID: req.params.user_id}
        List.find(query, function(err, list){
            if(err) res.send(err);

            res.json(list);
        });
    })

    .post(function(req, res){
        var list = new List();

        list.userID = req.params.user_id;
        list.listTitle = req.query.title;
        list.isDone = false;

        list.save(function(err){
            if(err) res.status(404).send(err);

            res.status(200).json({message:"List created for " + req.params.user_id + " with name: " + req.query.title});
        });
})


router.route('/users/setLists/:list_id')
.put(function(req, res){
    var query = {_id: req.params.list_id};
    List.findById(req.params.list_id, function(err, list){
        if(err) res.send(err);

        list.isDone = !list.isDone;

        list.save(function(err){
            if(err) res.send(err);

            res.send("list is set to : " + list.listIsDone);
        })
    })
})

/*
-----------------------------------
Router to Get a specific list, Delete a specific list, Update a specific list
-----------------------------------
*/
router.route('/users/lists/:user_id/:list_id')
.get(function(req, res){
    var query = {_id: req.params.list_id, userID: req.params.user_id}
    List.find(query, function(err, list){
        if(err) res.send(err);

        res.send(list);
    })
})

.delete(function(req, res){
    var query = {_id: req.params.list_id, userID: req.params.user_id}
    List.findOneAndDelete(query, function(err){
        if(err) res.send(err);

        res.send({message: "The list has been deleted"});
    })
})

.put(function(req, res){
    var query = {_id: req.params.list_id, userID: req.params.user_id}
    List.find(query, function(err, list){
        list.listTitle = req.query.title;
        list.save(function(err){
            if(err) res.send(err);
            
            res.send({message: "List title updated to : " + req.query.title});
        })
    })
})


/*
-----------------------------------
Router to Create a task
-----------------------------------
*/
router.route('/users/addTask/:list_id')
    .post(function(req, res){

        var task = new Task();

        task.listID = req.params.list_id;
        task.taskTitle = req.query.title;
        task.taskIsDone = false;

        task.save(function(err){
            if(err) res.send(err);

            res.send("Created task");
        })
})

router.route('/users/tasks/:list_id')
.get(function(req, res){
    Task.find({listID: req.params.list_id}, function(err, task){
        if(err) res.send(err);

        res.json(task);
    })
})


/*
---------------------------------
Router to Get a task, Update a task's title
-----------------------------------
*/
router.route('/users/tasks/:task_id')
    .get(function(req, res){
        var query = {_id: req.params.task_id};
        Task.findById(query, function(err, task){
            if(err) res.send(err);

            res.json(task);
        })
    })
    .put(function(req, res){
        Task.findById(req.params.task_id, function(err, task){
            if(err) res.send(err);

            task.taskTitle = req.query.title;

            task.save(function(err){
                if(err) res.send(err);

                res.send("Task title is set to : " + task.taskTitle);
            })
        })
    })
    .delete(function(req, res){
        Task.findOneAndDelete({_id: req.params.task_id}, function(err){
            if(err) res.send(err);

            res.send({message: "The task has been deleted"});
        })
    })


/*
---------------------------------
Router to set a task as done/not done
-----------------------------------
*/
router.route('/users/settask/:task_id')
.put(function(req, res){
    Task.findById(req.params.task_id, function(err, task){
        if(err) res.send(err);

        task.taskIsDone = !task.taskIsDone;

        task.save(function(err){
            if(err) res.send(err);

            res.send("Task is set to : " + task.taskIsDone);
        })
    })
})


/*
---------------------------------
Router to get all users
-----------------------------------
*/
router.route('/users')
    .get(function(req,res){
        User.find(function(err, user){
            if(err) res.send(err);

            res.json(user);
        });
});


//Registering out routes
app.use('/api', router);

//Start the server
app.listen(port, () =>console.log('Listening on ' + port));

