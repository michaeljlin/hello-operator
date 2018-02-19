import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './about.css'


class About extends Component{

    render(){

            return (
                <div id="about">
                    <div id="about_container">
                        <h1>Game Description</h1>
                        <p>Hello Operator is a game designed to encourage communication and cooperation among its players. Each game includes an Agent and a Handler who must work together to complete a mission, as each player has different information. The Handler has essentially a blueprint and knows where security mesaures such as cameras are, as well as other places of interest. The Agent actually carries out the mission, relying on the spymaster to guide the Agent past cameras and guards. Only with effective teamwork can the mission objective be carried out. </p>

                        <h1>Game Development</h1>
                        <p>This game was constructed with Javascript, and the game itself runs in an HTML5 Canvas. The rest of the pages were built in ReactJS, with Redux implemented for app-wide information storage. The server and database were made with NodeJS and MySQL, respectively. Rapid client and server communication achieved with Socket.io. </p>

                        <h1>About the Developers</h1>
                        <p>The four main developers who built Hello Operator are Michael Lin, Rebecca Brewster, Saeed Alavi, and Harry Tran. Saeed and Harry contributed to the design and setup of backend functionality. Saeed created and integrated sign up processes including authentication with Passport. Harry set up the initial database and implemented the child process used to transition from the lobby to the game. Rebecca was the primary frontend developer, creating the game pages in React and adding Redux to handle the sum of information necessary to support the lobby. Michael initially handled client-server communication by setting up Socket.io and constructed the game itself, eventually moving to server side updating and maintenance. </p>
                        <p>We all met as students of a web development school in Irvine, CA known as Learning Fuze. This game was intended as our final project before graduating the program. We have continued to work on this project, and would love to talk about our experiences building this game and the features we plan on adding. Our github information and portfolio sites are included below. </p>

                        <div className="container">
                            <div className="row">
                                <div className="col-md-12 developer">
                                    <h4>Hello Operator</h4>
                                    <link/>Github
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-3 developer">
                                    <h4>Michael</h4>
                                    <link/>Github
                                    <link/>Portfolio
                                </div>
                                <div className="col-md-3 developer">
                                    <h4>Rebecca</h4>
                                    <link/>Github
                                    <link/>Portfolio
                                </div>
                                <div className="col-md-3 developer">
                                    <h4>Saeed</h4>
                                    <link/>Github
                                    <link/>Portfolio
                                </div>
                                <div className="col-md-3 developer">
                                    <h4>Harry</h4>
                                    <link/>Github
                                    <link/>Portfolio
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            );
        }


}



export default About;