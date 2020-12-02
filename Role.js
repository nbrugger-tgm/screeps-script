/*
* Module code goes here. Use 'module.exports' to export things:
* module.exports.thing = 'a thing';
*
* You can import it from another modules like this:
* var mod = require('Role');
* mod.thing == 'a thing'; // true
*/
var lodash = require('lodash');

var bodyParts = {
	MOVE: {power:50,part:MOVE},
	WORK: {power:100,part:WORK},
	CARRY: {power:50,part:CARRY},
	ATTACK: {power:80,part:ATTACK},
	"RANGED_ATTACK": {power:150,part:RANGED_ATTACK},
	HEAL: {power:250,part:HEAL},
	CLAIM: {power:600,part:CLAIM},
	TOUGH: {power:50,part:TOUGH}
};
module.exports = function(behaviour,prefix,bodyTable,followers,minEnergy) {
	this.minEnergy = minEnergy;
	this.behave = behaviour;
	this.prefix = prefix;
	this.followers = followers;
	this.onTick = function(){};
	this.hivemind = null;
	this.init = ()=>{};
	this.live = function(me){
		if	(me.ticksToLive < 50 && (me.memory.age <= 5 || me.memory.age == undefined)){
			let spawn =  me.room.find(FIND_MY_SPAWNS)[0];
			let err = spawn.renewCreep(me);
			if(err === ERR_NOT_IN_RANGE) {
				me.moveTo(spawn);
				me.say(":'(")
			} else{
				me.say("<3");
				me.memory.age ++;
			}

			return true;
		}else{
			return this.behave(me);
		}
	},
	this.create = function() {
		return {
			role: this.prefix,
			age: 0
		}
	},
	this.getBody = function(power){
		body = [];
		var powerUse = 0;
		for(part in bodyTable){
			var allowedConsume = power*bodyTable[part];
			var partPower = bodyParts[part].power;
			var parts = Math.ceil(allowedConsume/partPower);
			powerUse += parts*partPower;
			while(powerUse>power){
				parts--;
				powerUse -= partPower;
			}
			for (var i = 0; i < parts; i++) {
				body.push(bodyParts[part].part);
			}
		}
		return body;
	}
};
