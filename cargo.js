/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('cargo');
 * mod.thing == 'a thing'; // true
 */
const externalPos = new RoomPosition(42,33,"E27N57");
const GOING_TO_WORK = 1,HARVESTING = 2,GOING_HOME = 3,DELIVERING = 4,SEARCHING_SOURCE = 5,SEARCHING_DELIVERY_POINT = 6;
module.exports = ()=>{
    let role = (require("harvester"))();

    role.prefix = "cargo";
    role.minEnergy = 300;
    role.getBody = function(power) {
        let body = [MOVE,CARRY,WORK];
        power -= 200;
        let fact = 0;
        while(power >= 50){
            body.push(CARRY);
            power -= 50;
            if(fact%3 == 0 && power >= 100){
                body.push(WORK);
                power -= 100;
                if(power>=50){
                    body.push(MOVE);
                    power -= 50;
                }
            }
        }
        return body;
    }
     role.findSource = function(me){
        me.memory.state = SEARCHING_SOURCE;
        me.memory.sourceTarget = externalPos;
        me.memory.state = GOING_TO_WORK;
    }
    return role;
}