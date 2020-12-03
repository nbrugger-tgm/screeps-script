/*
* Module code goes here. Use 'module.exports' to export things:
* module.exports.thing = 'a thing';
*
* You can import it from another modules like this:
* var mod = require('society');
* mod.thing == 'a thing'; // true
*/
const replacementWork = true;
const preference = "harvester";
const Hivemind = require('hivemind');
const settings = require('settings');

module.exports = {
		hivemind: new Hivemind(),
		population: Object.keys(Game.creeps),
		roles: {
			harvester: require("cool_harvester"),
			builder: require("builder"),
			upgrader: require("upgrader"),
			//cargo: require("cargo")(),
			repair_drone: require("repair_drone"),
			supplier: require("supplier")
		},
		init: function() {
			for (let key of Object.keys(this.roles)) {
				this.roles[key].hivemind = this.hivemind;
				this.roles[key].init();
			}
		},
		spawnCreep: function(spawn,role,energy){
		    if(Game.spawns[spawn].spawning)
		    	return;
		    console.log("Spawn "+role +" on "+spawn);
		    let mainRole = this.roles[role];
		    let name = mainRole.prefix+Math.ceil(Math.random()*99);
			let personality = mainRole.create();
			let body = mainRole.getBody(energy);
			let err = Game.spawns[spawn].spawnCreep(body,name,{memory:personality});
			if(err !== OK){
				console.log(err);
				return false;
			} else {
				console.log("Spawn successfull");
				this.population.push(name);
				return true;
			}
		},
		work: function () {
		    for(let role of Object.keys(this.roles))
		         this.roles[role].onTick();
			this.population = Object.keys(Game.creeps);
			top_loop: for(member in this.population){
				member = this.population[member];
				var screep = Game.creeps[member];
				if(screep.spawning)
				    continue;
				var task = 0;
				let role = screep.memory.role;
				var roles = this.roles[role].followers;
				var done = true;
				do {
					if(!done)
					    //console.log("Switch from("+screep.memory.role+") to alternative JOB ("+role+")");
					if(role === undefined || role===null){
					    screep.say("IDLE");
					    break;
					}
					if(!settings.reha[role])
						try{
							done = this.roles[role].live(screep);
						}catch(e){
						 console.log("Error on executin "+role+" job ");
						 throw e;
						}
					else {
						done = false;
						screep.say("🍹");
						screep.moveTo(22,12);
						continue top_loop;
					}
					if(!replacementWork)
					    break;
					role = roles[task++];
				}while(!done);
				if(!done) {
					screep.say("IDLE");
					console.log(screep.memory.role +" -> "+JSON.stringify(roles)+" IDLES");
				}
			}
		},
		reproduce: function (){
			for(let i in Memory.creeps) {
			    if(!Game.creeps[i]) {
			        delete Memory.creeps[i];
			    }
			}
			this.population = Object.keys(Game.creeps);
			let populationCount = {};
			for (let member of this.population) {
				let role = Game.creeps[member].memory.role;
				if(populationCount[role])
					populationCount[role]++;
				else
					populationCount[role] = 1;
			}
			if(this.checkPopulation(populationCount,preference))return;
			for(let role in settings.targetPopulation){
			    //console.log(role + " Population ("+populationCount[role]+"/"+this.targetPopulation[role]+")");
				if(this.checkPopulation(populationCount,role))
					return;
			}
		},
		checkPopulation: function(populationCount,role){
			if((populationCount[role] === undefined && settings.targetPopulation[role]>0) || populationCount[role]<settings.targetPopulation[role]){
				let spawn = this.bestSpawn();
				if(this.roles[role].minEnergy <= spawn.room.energyAvailable)
					return this.spawnCreep(spawn.name,role,spawn.room.energyAvailable);
			}
			return false;
		},
		bestSpawn: function (){
			let spawn = false;
			for (let next of Object.keys(Game.spawns)) {
				next = Game.spawns[next];
				if(!spawn)
					spawn = next;
				else if (spawn.store.energy < next.store.energy)
					spawn = next;
			}
			return spawn;
		}
};
