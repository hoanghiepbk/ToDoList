const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const func = require(__dirname + '/func.js');
const app = express();

mongoose.connect("mongodb+srv://admin-hoanghiep:hermione96@cluster0.eked0.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemSchema = {
  name : String,
}

const listSchema = {
  name : String,
  items: [itemSchema]
}

const scoseSchema = {
  score : 0
}

const dateSchema = {
  date: String,
}

const Date = mongoose.model("Date", dateSchema);

const Score = mongoose.model("Score", scoseSchema);

const List = mongoose.model("List", listSchema); // create colection items

app.use(express.static('public'));

app.use(bodyParser.urlencoded({entend: true}));

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    List.find({}, async function(err, foundList){
    if(!err){
      const day = func.getDay();
      Date.findOne({}, function(err, savedDate){
        if (savedDate){
          if(day == savedDate.date){
            savedDate.date = day;
            savedDate.save();
            foundList = [];
            // foundList.save()
            console.log("run first")
          }
        } else {
          const date = new Date ({
            date: day,
          })
          date.save();
        }

      });
      const lists = foundList;
      console.log(foundList,"foundList")
      if(foundList.length == 0){
        const defaultScore = new Score ({
          score: 0,
        })
        defaultScore.save();
        const workList = new List({
          name: "Work list",
          items: []
        });
        const homeList = new List({
          name: "Home list",
          items: []
        });
        const specialList = new List({
          name: "Special list",
          items: []
        });
        const defaultLists = [workList, homeList, specialList];
        // await List.insertMany(defaultLists, function(err){
        //   if (err) {
        //       console.log(err);
        //   } else {
        //       console.log("Successfully !")
        //       console.log('redirect')
        //       res.redirect("/");
        //   }
        // })
        const listInsert = await List.insertMany(defaultLists);
        res.redirect("/");
      } else {
          Score.find({}, function(err, foundScore){
          res.render("list", {day: day , lists: lists, score: foundScore[0].score})
        })
      }
    }
  })

})

app.post('/', function(req, res){
  const listName = req.body.listName;
  const itemName = req.body.work;
  List.findOne({name: listName}, async function(err, foundList){
    if(!err){
      const item = {
        name : itemName
      };
      foundList.items.push(item)
      const save = await foundList.save();
      res.redirect('/')
    } else {
      console.log(err)
    }
  })
})

app.post('/done', function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: id}}}, function(err){
    if(err){
      console.log(err)
    } else{
      console.log("Congratulation")
    }
  })
  Score.findOne({}, async function(err, foundScore){
    foundScore.score ++;
    const save = await foundScore.save();
    res.redirect("/")
  });

});

app.listen(process.env.PORT? process.env.PORT : 3000, function(){
  console.log("Server is listening !");
})
