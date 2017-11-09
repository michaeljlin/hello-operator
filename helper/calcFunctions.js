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
};

module.exports['radCalc'] = function(newCoord, oldCoord){
    let xDirection = newCoord.x - oldCoord.x;
    let yDirection = newCoord.y - oldCoord.y;

    var thetaRadians = null;

    if(yDirection < 0 && xDirection < 0){
        thetaRadians = Math.atan(yDirection/xDirection);
    }
    else if(yDirection < 0 && xDirection > 0){
        thetaRadians = Math.atan(xDirection / Math.abs(yDirection));
    }
    else if(yDirection < 0 || xDirection < 0){
        thetaRadians = -Math.atan(xDirection / yDirection);
    }
    else {
        thetaRadians = Math.atan(yDirection / xDirection);
    }

    // Adjustments for different x & y pos/neg values
    if(xDirection < 0 && yDirection > 0){
        thetaRadians = (thetaRadians / (Math.PI / 180) + 90) * (Math.PI / 180);
    }

    if(xDirection < 0 && yDirection < 0){
        thetaRadians = (thetaRadians / (Math.PI / 180) + 180) * (Math.PI / 180);
    }

    if(xDirection > 0 && yDirection < 0){
        thetaRadians = (thetaRadians / (Math.PI / 180) + 270) * (Math.PI / 180);
    }

    return thetaRadians;
};