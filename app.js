const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-harshit:Harshit1107@cluster0.0thhj.mongodb.net/todolistDB", {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false 
});

const tasksSchema = {
    name: String
};

const Task = mongoose.model("Task", tasksSchema);

const task1 = new Task({
    name: "Welcome to Your Task Keeper App"
});
const task2 = new Task({
    name: "Hit the + button to add new Task"
});
const task3 = new Task({
    name: "<-- Hit this to delete a Task"
});

const defaultTaskArray = [task1, task2, task3];

const listSchema = {
    name: String,
    items : [tasksSchema]
}

const List = new mongoose.model("List", listSchema);


app.get("/", function(req,res){

    Task.find({}, function(err, foundTask){
        if(err){
            console.log(err)
        }else{

            if(foundTask.length === 0)
            {
                Task.insertMany(defaultTaskArray, function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Default Task Added Successfully");
                    }
                })
                res.redirect("/")
            }else{
                res.render("list", {listTitle: "Today", newListItems:foundTask});
            }
        }
    })

    
});


app.get("/:customListName", function(req,res){

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName}, function(err,foundList){
        if(!err){
            if(!foundList)
            {
                const list = new List({
                    name: customListName,
                    items: defaultTaskArray
                });
                list.save(function(err){
                    if (!err) {
                        res.redirect('/' + customListName);
                    }
                })
            }
            else{
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    })
    
});



app.post("/",function(req,res){
    const taskName = req.body.newTask;
    const listName = req.body.list;

    const newTask = new Task({
        name: taskName
    })

    if(listName === "Today")
    {
        newTask.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(newTask);
            foundList.save();
            res.redirect("/" + listName);

        })
    }
    
})

app.post("/delete", function(req,res){
    const deleteTaskID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
        Task.findByIdAndRemove(deleteTaskID, function(err){
            if(err){
                console.log(err)
            }else{
                console.log("Deleted Successfully")
                res.redirect("/")
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deleteTaskID}}}, function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        })
    }
    
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Your server is running at port 3000");
});

