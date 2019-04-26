const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = (process.env.PORT || 5000);
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/test';
const MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoURI, function(error, databaseConnection) {
    db = databaseConnection;
});
var results;
const valid_vehicles = ["JANET","NgfcWZmS", "tNEh59TC", "suFKyeZg", "VMerzMH8", "6tWDkKh6", "ajNnfhJj", "bCxY6mCw", "Cq4NX9eE", "mXfkjrFw",
 "EMYaM9D8", "nZXB8ZHz", "Tkwu74WC", "TnA763WN", "TaR8XyMe", "5KWpnAJN", "uf5ZrXYw"];

express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))

    .post('/rides', (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        var role = identify_request(req);
        if (role !== "wrong") {
            var toInsert = {"username": req.body.username};
            toInsert["lat"] = req.body.lat;
            toInsert["lng"] = req.body.lng;
            databaseInsert(role, toInsert);
            if (role === "vehicles") {
                res_coll = "passengers";
            } else {
                res_coll = "vehicles";
            }
            db.collection(res_coll, function(er, collection) {
                collection.find({created_at: {$gt: new Date(new Date().getTime() - 1000 * 60 * 3)}}).toArray(function(err, results) {
                    if (res_coll == "passengers") {
                        res.json({"passengers": results});
                    } else {
                        res.json({"vehicles": results});
                    }
                })
            });
        } else {
            res.json({"error":"Whoops, something is wrong with your data!"});
        }      
    })

    .get('/passenger.json', (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        var name = req.query.username;
        if (name === undefined) {
            res.json([]);
        } else {
            db.collection("passengers", function(er, collection) {
                collection.find({username: name}).toArray(function(err, results) {
                    res.json({"passengers":results});
                });
            });
        }
    })


    .get('/', (req, res) => { 
        res.set('Content-Type', 'text/html');
        var indexPage = "";

        db.collection("vehicles", function(err, coll) {
            coll.find().sort({created_at: -1}).toArray(function (err, results) {
                indexPage += "<!DOCTYPE HTML><html><head><title>All vehicles</title></head><body>";
                indexPage += "<h1>All the vehicles in the database are here, in descending order:</h1>";
                if (results.length == 0) {
                    indexPage += "<p> No results. </p>"; 
                } else {
                    for (var i = 0; i < results.length; i++) {
                        indexPage += "<p>" + results[i].username + " was looking for passengers at "
                            + results[i].lat + ", " + results[i].lng + " on " + results[i].created_at + "</p>";
                    }
                }
                indexPage += "</body></html>";
                res.send(indexPage);
            });
        });
    })

    .listen(PORT)

// helper functions 
function identify_request(request) {
    if ((request.body.username === undefined) ||
        (request.body.lat === undefined) ||
        (request.body.lng === undefined)) {
        return "wrong";
    } else if (valid_vehicles.includes(request.body.username)) {
        return "vehicles";
    } else {
        return "passengers";
    }
}

function databaseInsert(role, toInsert) {
    toInsert["created_at"] = new Date();
    db.collection(role, (error, coll) => {
        coll.insert(toInsert, (error, saved) => {
            if (error) {
                alarm();
            }
        });
    });
}























