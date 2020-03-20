const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require(`body-parser`)
const mysql = require('mysql');

const PORT = 3000

var dbconfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: "secretbox_users"
}

var conn = mysql.createConnection(dbconfig);
/*
conn.connect((err) =>{
    if(err) throw err;
    console.log("brv");
    conn.query("INSERT INTO secretbox_users VALUES",(err,result) =>{
        if(err) throw err; 
        console.log(`rezulat: ${result}`);
    });
});
*/





var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/static/registration.html', urlencodedParser , (req, res) =>{
    if(conn) conn.release;
    
    let name = req.body.nameInput;
    let mail = req.body.emailInput;
    console.log(name, mail)
    conn.connect((err) =>{
        if(err){
            console.error(`brt eve ${err}`);
    }})
    insertData(name,mail);
    if(conn) conn.end;
    res.send(`ime: ${name} mail: ${mail}`);
    
})

function insertData(name, mail){
    console.log("brv");
    var sql = `INSERT INTO users (username, email) VALUES (${conn.escape(name)}, ${conn.escape(mail)})`;
    conn.query(sql,(err,result) =>{
        if(err) {
            console.error(`brt eve vo vtoro ${err}`);
            throw err;
        } else{
        console.log(`1 record inserted ${result}`)}        
        });
        
    
}


//- Reconnection function
function reconnect(conn){
    console.log("\n New connection tentative...");

    //- Destroy the current connection variable
    if(conn) conn.destroy();

    //- Create a new one
    conn = mysql.createConnection(dbconfig)

    //- Try to reconnect
    conn.connect(function(err){
        if(err) {
            //- Try to connect every 2 seconds.
            setTimeout(reconnect, 2000);
        }else {
            console.log("\n\t *** New connection established with the database. ***")
            return conn;
        }
    });
}


//- Error listener
conn.on('error', function(err) {

    //- The server close the connection.
    if(err.code === "PROTOCOL_CONNECTION_LOST"){    
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        conn = reconnect(conn);
    }

    //- Connection in closing
    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        conn = reconnect(conn);
    }

    //- Fatal error : connection variable must be recreated
    else if(err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        conn = reconnect(conn);
    }

    //- Error because a connection is already being established
    else if(err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE"){
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
    }

    //- Anything else
    else{
        console.log("/!\\ Cannot establish a connection with the database. /!\\ ("+err.code+")");
        conn = reconnect(conn);
    }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`))