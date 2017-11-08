module.exports = {};

module.exports['circleCalc'] = function(objToUpdate, oldCoord, nextCoord, comparedObject){
    let distX = Math.abs(comparedObject.x - oldCoord.x-objToUpdate.status.width/2);
    let distY = Math.abs(comparedObject.y - oldCoord.y-objToUpdate.status.height/2);

    if(distX > (objToUpdate.status.width/2 + comparedObject.r)){
        return false;
    }
    if(distY > (objToUpdate.status.height/2 + comparedObject.r)){
        return false;
    }

    if(distX <= (objToUpdate.width / 2)){
        return true;
    }
    if(distY <= (objToUpdate.height / 2)){
        return true;
    }

    let dx = distX - objToUpdate.status.width/2;
    let dy = distY - objToUpdate.status.height/2;

    return ( dx*dx+dy*dy <= (comparedObject.r*comparedObject.r) );
}