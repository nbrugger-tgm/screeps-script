/*
* Module code goes here. Use 'module.exports' to export things:
* module.exports.thing = 'a thing';
*
* You can import it from another modules like this:
* var mod = require('rendering');
* mod.thing == 'a thing'; // true
*/

module.exports = {
	renderHubs() {
		for (spawn in Game.spawns) {
			spawn = Game.spawns[spawn];
			if (!spawn.spawning)
				continue;
			var spawningCreep = Game.creeps[spawn.spawning.name];
			spawn.room.visual.text(
				'🛠️' + spawningCreep.memory.role,
				spawn.pos.x + 1,
				spawn.pos.y,
				{align: 'left', opacity: 0.8});
		}
	},
	renderHivemind(hivemind){
		console.log("Paint hivemind : "+JSON.stringify(hivemind.data,2));
		for(let grp in hivemind.data){
			let ids = Object.keys(hivemind.data[grp]);
			let max = hivemind.maxVals[grp];
			if(max === undefined)
				max = 5;
			if(max > 10)
				continue;
			for(let id of ids){
				let current = hivemind.data[grp][id];
				let object = Game.getObjectById(id);
				object.room.visual.text(
					current+"/"+max,
					object.pos.x,
					object.pos.y+1,
					{align: 'center', opacity: 0.75,fontSize: 0.75,color: hivemind.isFree(grp,id) ? "#148301" : "#911f0d"});
			}
		}
	}
};
