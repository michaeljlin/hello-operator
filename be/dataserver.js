const credentials = require('./cred');
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');

const connection = mysql.createConnection(credentials);
const webServer = express();
const io = require('socket.io')(http);



webServer.use(bodyParser.urlencoded({ extended: false }));
webServer.use( bodyParser.json() );

webServer.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// End Point
// webServer.get('/basicEndpoint',function(req, res){
//     connection.connect(() => {
//         connection.query(
//             `SELECT * FROM users;`
//             , function(err, results, fields){
//                 const output = {
//                     success: !err,
//                     data: results,
//                     error: err ? err : 'No Errors',
//                 };
//                 res.end(JSON.stringify(output));
//             });
//     });
// });

webServer.get('/home',function(req,res){
   res.end('Home Page')
});

webServer.get('/signup',function(req,res){
    res.sendFile('./sigup.html',{root:__dirname});
});

io.on('connection',function(socket){
    socket.on('login_submit',function(inputValues,id){
        let user = {
        "firstName" : inputValues.first_name,
        "lastName" : inputValues.last_name,
        // "birthOfDate": req.body.birthOfDate,
        "email":inputValues.email,
        "userName" : inputValues.userName,
        "password" : inputValues.password

    };

    let confirmPassword = inputValues.confirmPassword;

    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let confirmed = true;

    if (user.firstName === null || user.firstName === "" || user.firstName === undefined)
    {
        console.log("Enter a firstName");
        confirmed = false;
    }

    if (user.lastName === null || user.lastName === "" || user.lastName === undefined)
    {
        console.log("Enter a lastName");
        confirmed = false;
    }

    if (!user.userName.match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)){
        console.log('userName problem');
        confirmed = false;
    }

    if (!re.test(user.email))
    {
        console.log('please enter a valid email address');
        confirmed = false;
    }



    if (user.password !== confirmPassword && user.password !== null && user.password !== undefined ){
        console.log("two passwords are not matched");
        confirmed = false;
    }


    if (confirmed === true){
        connection.connect((err) => {
            if (err){console.log('error imn connection',err)}
            else {
                connection.query(`insert into user_info set ?` , user, function(error,rows, fields)
                {
                    if (!!error) {
                        console.log('error in query');
                    }
                    else {
                        console.log('successful query\n');
                        console.log(rows);
                    }
                });

            }
        });



    }


    })


});

// webServer.post('/signup',function(req,res){
//     let user = {
//         "firstName" : req.body.firstName,
//         "lastName" : req.body.lastName,
//         // "birthOfDate": req.body.birthOfDate,
//         "email":req.body.email,
//         "userName" : req.body.userName,
//         "password" : req.body.password
//
//     };
//
//     let confirmPassword = req.body.confirmPassword;
//
//     let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     let confirmed = true;
//
//     if (user.firstName === null || user.firstName === "" || user.firstName === undefined)
//     {
//         console.log("Enter a firstName");
//         confirmed = false;
//     }
//
//     if (user.lastName === null || user.lastName === "" || user.lastName === undefined)
//     {
//         console.log("Enter a lastName");
//         confirmed = false;
//     }
//
//     if (!user.userName.match(/(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)){
//         console.log('userName problem');
//         confirmed = false;
//     }
//
//     if (!re.test(user.email))
//     {
//         console.log('please enter a valid email address');
//         confirmed = false;
//     }
//
//
//
//     if (user.password !== confirmPassword && user.password !== null && user.password !== undefined ){
//         console.log("two passwords are not matched");
//         confirmed = false;
//     }
//
//
//     if (confirmed === true){
//         connection.connect((err) => {
//             if (err){console.log('error imn connection',err)}
//             else {
//                 connection.query(`insert into user_info set ?` , user, function(error,rows, fields)
//                 {
//                     if (!!error) {
//                         console.log('error in query');
//                     }
//                     else {
//                         console.log('successful query\n');
//                         console.log(rows);
//                     }
//                 });
//
//             }
//         });
//
//
//
//     }
//
// });


webServer.listen(4000,function() {
    console.log('the server is started');
});
