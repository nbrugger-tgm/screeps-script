/*
* Module code goes here. Use 'module.exports' to export things:
* module.exports.thing = 'a thing';
*
* You can import it from another modules like this:
* var mod = require('harvester');
* mod.thing == 'a thing'; // true
*/
let spawn = true;
function behave(me){
    if(!me.memory.upgrading){
        var source = me.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType === STRUCTURE_CONTAINER || (structure.structureType === STRUCTURE_SPAWN &&spawn&&structure.my)) &&
					structure.store.energy > 0;
			}
		});
        if(spawn){
            spawn = me.room.find(FIND_STRUCTURES, {filter: (structure) => (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE)}).length === 0;
        }
		if(source.length == 0){
		    me.say("IDLE");
		    return false;
		}else{
		    var err = me.withdraw(source[0],RESOURCE_ENERGY);
		    if(err == ERR_NOT_IN_RANGE)
		        me.moveTo(source[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            else if (err == ERR_FULL){
                me.memory.upgrading = true;
            }
		    else if(err != OK){
		        console.log("Withdraw failed : "+err);
		        return false;
		    }
		    me.memory.upgrading = me.carry.energy == me.carryCapacity;
		}
    }else{
        var err = me.upgradeController(me.room.controller);
        if(err == ERR_NOT_IN_RANGE)
            me.moveTo(me.room.controller, {visualizePathStyle: {stroke: '#ffaa00'}});
        else if (err == OK){
            me.memory.upgrading = me.carry.energy != 0;
        }else if(err == ERR_NOT_ENOUGH_RESOURCES){
            me.memory.upgrading = false;
        }else{
            console.log("Unexpected error on upgrade : "+err);
            return false;
        }
    }
	return true;
};
var Role = require('Role');
module.exports = new Role(behave,"upgrader",undefined,["harvester"],200);
module.exports.getBody = function(power) {
    var body = [CARRY,MOVE,WORK];
    power -= 200;
    while(power >= 100){
       body.push(WORK);
       power -= 100;
       if(power>=50){
           body.push(CARRY);
           power-=50;
       }
       if(power >= 50){
           body.push(MOVE);
           power -= 50;
       }
    }
    return body;
}
