/*
* Module code goes here. Use 'module.exports' to export things:
* module.exports.thing = 'a thing';
*
* You can import it from another modules like this:
* var mod = require('rendering');
* mod.thing == 'a thing'; // true
*/

module.exports = {
	renderHubs(){
		for(spawn in Game.spawns){
			spawn = Game.spawns[spawn];
			if(!spawn.spawning)
				continue;
	        var spawningCreep = Game.creeps[spawn.spawning.name];
			spawn.room.visual.text(
	            '🛠️' + spawningCreep.memory.role,
	            spawn.pos.x+1, 
	            spawn.pos.y, 
	            {align: 'left', opacity: 0.8});			
		}
	}
};
