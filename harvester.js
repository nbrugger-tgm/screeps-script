
const GOING_TO_WORK = 1,HARVESTING = 2,GOING_HOME = 3,DELIVERING = 4,SEARCHING_SOURCE = 5,SEARCHING_DELIVERY_POINT = 6;
const SOURCES = "sources";
let hivemind;
var Role = require('Role');
module.exports = () => {
	let role = new Role(null, "harvester", undefined, [/*"cargo","upgrader"*/], 200);

	role.findTarget = function(me){
		this.releaseSource(me);
		me.memory.state = SEARCHING_DELIVERY_POINT;
		//console.log("Hiveminf : "+JSON.stringify(hivemind));
		let targets = me.room.find(FIND_MY_STRUCTURES, {
			filter: (structure) => (
				(structure.structureType === STRUCTURE_EXTENSION ||
				structure.structureType === STRUCTURE_SPAWN ) &&
				structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
				structure.id !== me.memory.ignore
			)
		});
		if(targets.length === 0) {
			targets = me.room.find(FIND_STRUCTURES, {
				filter: (structure) => (
					(structure.structureType == STRUCTURE_TOWER ||
						structure.structureType == STRUCTURE_STORAGE ||
						structure.structureType == STRUCTURE_CONTAINER ||
						structure.structureType == STRUCTURE_POWER_BANK) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
					structure.id !== me.memory.ignore
				)
			});
		}
		delete me.memory.ignore;
		me.memory.idle = targets.length == 0;
		if(me.memory.idle){
			console.log("Cant find deposit");
			return;
		}
		targets = _.sortBy(targets, s => me.pos.getRangeTo(s));
		me.memory.target = targets[0].id;
		me.memory.state = GOING_HOME;
	};
	role.findSource = function(me){
		this.releaseSource(me);
		me.memory.state = SEARCHING_SOURCE;
		//console.log("Hivemind : "+ JSON.stringify(hivemind.data));
		let targets = me.room.find(FIND_SOURCES_ACTIVE, {
			filter: (structure) => hivemind.isFree(SOURCES,structure.id) &&  structure.id !== me.memory.ignore
		});
		delete me.memory.ignore;
		me.memory.idle = targets.length === 0;
		if(me.memory.idle){
			console.log("Cant find source "+JSON.stringify(hivemind));
			return;
		}
		targets = _.sortBy(targets, s => me.pos.getRangeTo(s));
		me.memory.sourceTarget = targets[0].id;
		this.lockSource(me);
		me.memory.state = GOING_TO_WORK;
	};
	role.lockSource = function(me) {
		hivemind.addLock(SOURCES,me.memory.sourceTarget);
	};
	role.releaseSource = function(me) {
		if(me.memory.sourceTarget === undefined)
			return;
		hivemind.releaseLock(SOURCES,me.memory.sourceTarget);
		delete me.memory.sourceTarget;
	};
	role.behave = function(me) {
		if(me.memory.state === undefined) me.memory.state = SEARCHING_SOURCE;
		let state = me.memory.state;
		if(state === GOING_TO_WORK) {
			let source,err;
			if (typeof(me.memory.sourceTarget) === "string") {
				source = Game.getObjectById(me.memory.sourceTarget);
				err = me.moveTo(source.pos.x,source.pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
			}else{
				source = {
					pos: me.memory.sourceTarget
				};
				err = me.moveTo(source.pos.x,source.pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
			if(err !== OK && err !== ERR_TIRED) {
				this.fail("move to source ", err);
				me.memory.ignore = source.id;
				this.findSource(me);
				return false;
			}
			if (me.pos.inRangeTo(source.pos, 1))
				me.memory.state = HARVESTING
		}
		else if(state === HARVESTING){
			let source = Game.getObjectById(me.memory.sourceTarget);
			let err = me.harvest(source);
			if(err !== OK){
				console.log("Harvest failed : "+err);
				me.memory.ignore = source.id;
				this.findTarget(me);
			}
			if(me.carry.energy === me.carryCapacity){
				this.findTarget(me);
			}else if(source.energy === 0) {
				this.findSource(me);
			}
		}else if(state === SEARCHING_DELIVERY_POINT){
			this.findTarget(me);
		}
		else if(state === GOING_HOME){
			let target = Game.getObjectById(me.memory.target);
			let err = me.moveTo(target,{visualizePathStyle: {stroke: '#ffaa00'}});
			if(err !== OK && err !== ERR_TIRED) {
				this.fail("move home", err);
				me.memory.ignore = target.id;
				this.findTarget(me);
				return false;
			}
			if(me.pos.inRangeTo(target.pos, 1)){
				me.memory.state = DELIVERING;
			}
		}else if(state === DELIVERING){
			let target = Game.getObjectById(me.memory.target);
			let err = me.transfer(target,RESOURCE_ENERGY);
			if(err !== OK){
				console.log("Cannot deliver : "+err);
				me.memory.ignore = target.id;
				this.findTarget(me);
			}
			if(me.carry.energy === 0){
				this.findSource(me);
			}else if(target.energy === target.energyCapacity){
				this.findTarget(me);
			}
		}else if(state === SEARCHING_SOURCE){
			this.findSource(me);
		}
		return !me.memory.idle;
	};

	role.fail = function(action,err){
		console.log("("+this.prefix+")"+action+" failed ! : "+err);
	}




	role.getBody = function(power) {
		let body = [MOVE,CARRY,WORK];
		power -= 200;
		let round = 0;
		while(power >= 150){
			body.push(WORK);
			body.push(MOVE);
			power -= 150;
			if(power >= 100 && ((round++)%3) === 0) {
				body.push(CARRY);
				body.push(MOVE);
				power-=100;
			}
		}
		return body;
	}
	role.init = function(){
		this.hivemind.setGroupMax(SOURCES,5);
		hivemind = this.hivemind;
	};
	return role;
}

