var x11 = require("rendering");
var soc = require("society");
global.soc = soc;
var war = require("war");
soc.init();
let run = 0;
module.exports.loop = function(){
    //for(creep in Game.creeps){
    //    if(Game.creeps[creep].memory.role == "harvester")
    //        delete Game.creeps[creep].memory.harvester;
    //}
    //Game.creeps.builder62.moveTo(Game.spawns["Spawn1"]);
	soc.work();
	soc.reproduce();
	war.onTick();
	x11.renderHubs();
	x11.renderHivemind(soc.hivemind);
}
global.reset = function(){
	for(let creep in Game.creeps){
		creep = Game.creeps[creep];
		creep.memory[creep.memory.role] = {};
	}
	soc.hivemind.data = {};
}
global.reset();