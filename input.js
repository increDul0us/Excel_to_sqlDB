  const mysql = require('mysql');  //use sql
  const fs = require('fs'); //reading file
  const express = require('express');  //app router
  const multer = require('multer'); // file storing middleware
  const bodyParser = require('body-parser'); //cleans our req.body
  const xlsxtojson = require("xlsx-to-json");
  const xlstojson = require("xls-to-json");

// SETUP APP
  const app = express(); 
  const port = process.env.PORT || 3000;  
  app.use(bodyParser.urlencoded({extended:false})); //handle body requests
  app.use(bodyParser.json()); 

//MULTER CONFIG: to get file uploads
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    cb(null, file.originalname);
  }
})
 
var upload = multer({ storage: storage });


app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
    res.send('File uploaded successfully ');
    console.log('File uploaded successfully ');
    
    //convert xcel to json
	xlsxtojson({
		input: `./uploads/${file.originalname}`,  // input xls 
	    output: `outputnew.json`, // output json 
	    lowerCaseHeaders:true
	}, 
    function(err, result) {
	    if(err) {
	      res.json(err);
	    } else {
	      console.log(result);
	    }
        
        //initiate connection to the created db
        var obj;
        const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "oes"
        });

        //parsing the json file and sending it to the sql db of the already created table
        fs.readFile('outputnew.json', 'utf8', function (err, data) {
            if (err) throw err;
            obj = JSON.parse(data);
            con.connect(function(err) {
                if (err) throw err;
                console.log("Connected to database!");
                for(var i = 0; i < obj.length; i++) {
                    const outlet = obj[i].outlet;
                    const username = obj[i].username;
                    const password = obj[i].password;
                    const voluntee = obj[i].voluntee;
                    const director = obj[i].director;
                    sql = "INSERT INTO customers (outlet, username , password , voluntee , director ) VALUES ('"+outlet+"', '"+username+"' , '"+password+"' , '"+voluntee+"' , '"+director+"')";

                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("Record Inserted");
                    });
                }
            });
        });
        
	});
});

app.listen(port,function(){
    console.log(`Server listening on port ${port}`);
});

module.exports = app;