// import openSocket from 'socket.io-client';
// const  socket = openSocket('http://localhost:8000');

// var socket = io();
function subscribeToTimer(cb, socket) {
    // console.log('connection identifier is: ',socket.id);
    socket.on('timer', color =>{
        console.log('connection identifier is: ',socket.id);
        // console.log('timestamp is now: ', color);
        return cb(null, color);
        }); //callback function

    // timestamp => cb(null, timestamp)
    // socket.emit('subscribeToTimer', 1000);

    socket.on('update', newState =>{
        console.log('connection identifier is: ',socket.id);
        console.log('newState is now: ', newState);
        return cb(null, null, newState);
    });
}

// function sendClick(event){
//     console.log('sending click!');
//     socket.emit('click', event);
// }

export { subscribeToTimer };