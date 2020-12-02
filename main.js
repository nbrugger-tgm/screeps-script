var x11 = require("rendering");
var soc = require("society");
var war = require("war");
soc.init();
let run = 0;
module.exports.loop = function(){
    //for(creep in Game.creeps){
    //    if(Game.creeps[creep].memory.role == "builder")
    //        Game.creeps[creep].suicide();
    //}
    //Game.creeps.builder62.moveTo(Game.spawns["Spawn1"]);
    if((run++)%1000 === 0){
    	soc.hivemind.data = {};
	}
	soc.work();
	soc.reproduce();
	war.onTick();
	x11.renderHubs();
}