// import React from 'react';
import intro from '../assets/sounds/Analog-Nostalgia.mp3';

// const backgroundSound = new Audio(intro);

function SoundBoard(){
    this.background = new Audio(intro);

    this.playBackground = function(){
        this.background.play();
    };

    this.stopBackground = function(){
        this.background.pause();
    };
}

const sound = new SoundBoard();

export default sound;