import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';
import './about.css'


class About extends Component{

    render(){

            return (
                <div id="about">

                    <div className="backlink">
                        <Link to={"/"}>Back to Login Page</Link>
                    </div>

                    <div id="about_container">
                        <h1>About Hello, Operator</h1>

                        <h1>Description</h1>
                        <p>Hello, Operator is a game designed to encourage communication and cooperation among its players. Each game includes an Agent and a Handler who must work together to complete a mission, as each player has different information. The Handler has essentially a blueprint and knows where security mesaures such as cameras are, as well as other places of interest. The Agent actually carries out the mission, relying on the spymaster to guide the Agent past cameras and guards. Only with effective teamwork can the mission objective be carried out. </p>

                        <h1>Development</h1>
                        <p>This app was constructed in React & Redux to utilize the framework's component & state features for scalable user management. The lobby relies on secured POST requests to a Node.js server for user logins & matchmaking requests. It is updated in real-time through a consistent connection maintained through Socket.io. A custom HTML5 Canvas based renderer built in JSX functions & Socket.io connections interprets real-time data from instanced Node.js server processes to serve multiple games simultaneously. An Amazon RDS MySQL database supports the app both with secured logins via user accounts & dynamic map creation for the game based on stored JSON objects.</p>

                        <h1>About the Developers</h1>
                        <p>The four main developers who built Hello Operator are Michael Lin, Rebecca Brewster, Saeed Alavi, and Harry Tran.</p>
                        <p>Michael worked on assembling the client-server structure in Node.js that would eventually run server side game simulations and serve HTML5 canvas drawing updates in real-time to clients. His duties included developing endpoints through Node.js & Express that would handle front-end requests and building the rendering engine on the frontend that would interpret continuous data streams from individually instanced game simulations in the backend. He also worked on refining the Passport.js authentication process to use JSON web tokens for secure requests.</p>
                        <p>Rebecca built the frontend in React & Redux that utilized authenticated POST requests for matchmaking and Socket.io powered connections for real-time game status updates. She designed the user interaction elements that allowed users to fluidly create & leave games at any time. Her duties included building multi-layered React components for managing the on-the-fly changes & developing the Redux actions needed to feed critical information to nested components.</p>
                        <p>Saeed and Harry contributed to the inital design and setup of the Node.js backend. Saeed implemented the initial structure of the sign up process through Passport.js. Harry set up the Amazon RDS server to host map data and implemented the child processes used to spawn instanced game simulations.</p>
                        <p>We all met as students of a web development school in Irvine, CA known as Learning Fuze. This game was intended as our final project before graduating the program. We have continued to work on this project, and would love to talk about our experiences building this game and the features we plan on adding. Our github information and portfolio sites are included below. </p>

                        <div className="container">

                                <div className="item">
                                    <h4>Hello Operator</h4>
                                    <a href='https://github.com/Learning-Fuze/c9.17_spygames' target='_blank' className='link'>Github</a>
                                </div>


                                <div className="item">
                                    <h4>Michael Lin</h4>
                                    <h5>Lead Developer & Network System Designer</h5>
                                    <a href='https://github.com/michaeljlin' target='_blank' className='link'>Github</a>
                                    <a href="http://www.michaeljameslin.com" target='_blank' className='link'>Portfolio</a>
                                </div>
                                <div className="item">
                                    <h4>Rebecca Brewster</h4>
                                    <h5>Lead Front End Developer</h5>
                                    <a href='https://github.com/R-Brewster' target='_blank' className='link'>Github</a>
                                    <a href='http://www.rebeccabrewster.com/' target='_blank' className='link'>Portfolio</a>
                                </div>
                                <div className="item">
                                    <h4>Saeed Alavi</h4>
                                    <h5>Backend Developer</h5>
                                    <a href='https://github.com/SaeedAlavi' target='_blank' className='link'>Github</a>
                                </div>
                                <div className="item">
                                    <h4>Harry Tran</h4>
                                    <h5>Backend Developer</h5>
                                    <a href='https://github.com/H2t2' target='_blank' className='link'>Github</a>
                                </div>

                        </div>
                    </div>

                </div>
            );
        }


}



export default About;