import React, { Component } from 'react';

export default (props) =>{
    const resultStyle = {
        // color: props.result
        color: 'blue'
    };

    console.log("running!");
    return (
        <div style={resultStyle}>Have some color!</div>
    )
}