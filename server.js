const express = require('express')
const app = express()
var mysql = require('mysql2');

///
///	Create connection to MySQL database server.
/// 
function getMySQLConnection() {
	return mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'password',
	  database : 'leaderboard'
	});
}


//routes

app.get('/',(req,res)=>{
    res.send('Hello Node API')

})

///
/// Use pug as templating engine. Pug is renamed jade.
///
app.set('view engine', 'pug');

///
/// HTTP Method	: GET
/// Endpoint 	: /person
/// 
/// To get collection of person saved in MySQL database.
///
app.get('/person', function(req, res) {
	var personList = [];

	// Connect to MySQL database.
	var connection = getMySQLConnection();
	connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });

	// Do the query to get data.
	connection.query('SELECT * FROM data', function(err, rows, fields) {
	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
	  		// Loop check on each row
	  		for (var i = 0; i < rows.length; i++) {

	  			// Create an object to save current row's data
		  		var person = {
                    'name':rows[i].Name,
		  			'id':rows[i].id,
		  			'points':rows[i].points
		  		}
		  		// Add object into array
		  		personList.push(person);
	  	}

	  	// Render index.pug page using array 
	  	res.render('index', {"personList": personList});
	  	}
	});

	// Close the MySQL connection
	connection.end();
	
});

///
/// HTTP Method	: GET
/// Endpoint	: /person/:id
/// 
/// To get specific data of person based on their identifier.
///
app.get('/person/:id', function(req, res) {
	// Connect to MySQL database.
	var connection = getMySQLConnection();
	connection.connect();

	// Do the query to get data.
	connection.query('SELECT * FROM data WHERE id = ' + req.params.id, function(err, rows, fields) {
		var person;

	  	if (err) {
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
	  		// Check if the result is found or not
	  		if(rows.length==1) {
	  			// Create the object to save the data.
	  			var person = {
                    'name':rows[0].Name,
		  			'id':rows[0].id,
		  			'points':rows[0].points,
		  		}
		  		// render the details.plug page.
		  		res.render('details', {"person": person});
	  		} else {
	  			// render not found page
	  			res.status(404).json({"status_code":404, "status_message": "Not found"});
	  		}
	  	}
	});

	// Close MySQL connection
	connection.end();
});

app.post('/person/:id', function(req,res){

    // Connect to MySQL database.
	var connection = getMySQLConnection();

    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected To Add Person!");
      });

      connection.query('SELECT * FROM data WHERE id = ' + req.body.id, function(err, rows, fields) {
		var person;

	  	if (err) {
            console.log(err)
	  		res.status(500).json({"status_code": 500,"status_message": "internal server error"});
	  	} else {
	  		// Check if the result is found or not
	  		if(rows.length==0){
                connection.query('INSERT INTO leaderboard (Name, ID, Points) VALUES (?,?,?)', [req.body.Name, req.body.id, req.body.points],(error, 
                    results) => {
                       if (error) return res.json({ error: error });
              
                       });
            }
        }
    });
    // Close MySQL connection
	connection.end();    
});

///
/// Start the app on port 300 
/// The endpoint should be: 
/// List/Index 	: http://localhost:3000/person
/// Details 	: http://localhost:3000/person/2
///
app.listen(3000, function () {
    console.log('listening on port', 3000);
});