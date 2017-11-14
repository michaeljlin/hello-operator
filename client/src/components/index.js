import React, { Component } from 'react';
import { Link, Route, Redirect } from 'react-router-dom';

class Landing extends Component{
    constructor(props){
        super(props);
        // this.state = {
        //     url: false
        // }
        // console.log(props);
    }
    // handleClick(url){
    //     this.setState({
    //         url: url
    //     });
    // }
    render(){

        return(
            <ul>
                <li>
                    <Link to="/lobby">Lobby</Link>
                </li>
                <li>
                    <Link to="/game">Game</Link>
                </li>
                <li>
                    <Link to="/Login">Login</Link>
                </li>
            </ul>
        )
        // console.log('url: '+this.state.url);
        // if(this.state.url){
        //     console.log('should not see this');
        //     return <div>mooooz<Redirect to={this.state.url} push={true}/></div>
        //
        // }
        // else  {
        //     console.log('is this redirecting?');
        //     return (
        //
        //
        //         <div>
        //             This will be the landing page!
        //
        //             <ul>
        //                 <li>
        //                     <a href="/game">Play Game</a>
        //                 </li>
        //                 <li>
        //                     <div onClick={() => {
        //                         this.handleClick('/lobby')
        //                     }}>test
        //                     </div>
        //                     <Link to="/lobby">Lobby</Link>
        //                 </li>
        //             </ul>
        //         </div>
        //     )
        // }
    }
}

export default Landing;