const GOING_TO_SOURCE = "go_to_src",COLLECTING = "collect",GOING_TO_SINK = "go_to_snk",LOADING_OFF = "load_of",SEARCHING_SOURCE = "search_src",SEARCHING_SINK = "search_snk";
let hivemind;
const Role = require('Role');

const examplePrio = [
	{
		name: "Spawn",
		hivemindLimit: -1,
		type: FIND_MY_STRUCTURES,
		subTypes: [STRUCTURE_SPAWN,STRUCTURE_EXTENSION],
		filter: (build,me)=>build.store.getFreeCapacity(ENERGY_RESOURCE),
		sorter: (build,me)=>me.pos.getRangeTo(build)
	},
	{
		name: "Storage",
		hivemindLimit: -1,
		type: FIND_STRUCTURES,
		subTypes: [STRUCTURE_STORAGE,STRUCTURE_CONTAINER,STRUCTURE_POWER_BANK],
		filter: (build,me)=>build.store.getFreeCapacity(RESOURCE_ENERGY)>0,
		sorter: (build,me)=>me.pos.getRangeTo(build)
	}
];
const appliedFilter = {
};

function lastFilter(name){
	let func = appliedFilter[name];
	if(func === undefined)
		return ()=>true;
	return func;
}
module.exports = (prefix,followers,minEngergy,sinkPriority,sourcePriority,sinkDisdance = 1,sourceDisdance = 1,collectorFunction,sinkFunction,stopSinkingCondition,stopCollectingCondition,log_minor = false,init = ()=>{}) => {
	let role = new Role(null, prefix, undefined, followers, minEngergy);
	role.disdanceSorter = (s,me)=>me.pos.getRangeTo(s);
	role.storeless = true;
	role.finding = function (me,subject,prioList,searchState,foundState) {
		me.memory[this.prefix].state = searchState;
		let targets;
		let prio;
		for (let cprio of prioList) {
			this.releaseSource(me,cprio.name);
			targets = me.room.find(cprio.type, {
				filter: (structure) => (
					structure.id !== me.memory[this.prefix].ignore &&
					(cprio.subTypes === undefined || cprio.subTypes.includes(structure.structureType)) &&
					//TODO: hivemind
					cprio.filter(structure,me)
				)
			});
			//console.log("["+me.name+"] Find "+subject+" -> "+cprio.name +" = "+targets.length)
			//console.log("    used: find("+cprio.type+",["+cprio.subTypes+"])");
			if (targets.length === 0 ) {
				if(log_minor)
					console.log("[" + me.name + "] No \"" + cprio.name + "\" " + subject + " found");
			} else {
				prio = cprio;
				break;
			}
		}
		delete me.memory[this.prefix].ignore;
		if(targets.length === 0){
			console.log("["+me.name+"] No "+subject+" found");
			me.memory[prefix].idle = true;
			return;
		}else{
			me.memory[prefix].idle = false;
		}
		targets = _.sortBy(targets, (s)=>prio.sorter(s,me));
		me.memory[this.prefix].target = targets[0].id;
		appliedFilter[me.name] = prio.filter;
		this.lockSource(me,prio.name);
		me.memory[this.prefix].state = foundState;
		this.behave(me);
	}
	role.findTarget = function(me) {
		this.finding(me, "sink", sinkPriority, SEARCHING_SINK, GOING_TO_SINK);
	}
	role.findSource = function(me) {
		this.finding(me, "source", sourcePriority, SEARCHING_SOURCE, GOING_TO_SOURCE);
	}
	role.lockSource = function(me,group) {
		hivemind.addLock(group,me.memory[this.prefix].target);
	};
	role.releaseSource = function(me,grp) {
		if(me.memory[this.prefix].target === undefined)
			return;
		hivemind.releaseLock(grp,me.memory[this.prefix].target);
	};
	role.behave = function(me) {
		if(me.memory[this.prefix] === undefined)
			me.memory[this.prefix] = {};
		//TODO optimite
		me.memory.storeless = me.room.find(FIND_STRUCTURES,{filter: (build)=>build.structureType === STRUCTURE_CONTAINER}).length === 0;
		if(me.memory[this.prefix].state === undefined) me.memory[this.prefix].state = SEARCHING_SOURCE;
		let state = me.memory[this.prefix].state;
		if(state === GOING_TO_SOURCE || state === GOING_TO_SINK) {
			let source, err;
			source = Game.getObjectById(me.memory[this.prefix].target);
			if (source === null) {
				if (state === GOING_TO_SOURCE)
					this.findSource(me);
				else
					this.findTarget(me);
			} else {
				if (state === GOING_TO_SOURCE) {
					if (stopCollectingCondition(me, source)) {
						this.findTarget(me);
						return me.memory[prefix].idle;
					} else if (!lastFilter(me.name)(source, me)) {
						this.findSource(me);
						return me.memory[prefix].idle;
					}
				} else {
					if (stopSinkingCondition(me, source)) {
						this.findSource(me);
						return me.memory[prefix].idle;
					} else if (!lastFilter(me.name)(source, me)) {
						this.findTarget(me);
						return me.memory[prefix].idle;
					}
				}
				err = me.moveTo(source.pos.x, source.pos.y, {visualizePathStyle: {
						fill: 'transparent',
						stroke: '#7eae2d',
						lineStyle: 'dashed',
						strokeWidth: .075,
						opacity: .75
					}});
				if (err !== OK && err !== ERR_TIRED) {
					console.log("[" + me.name + "] Moving to " + (state === GOING_TO_SINK ? "sink" : "source") + " failed : " + err);
					me.memory[this.prefix].ignore = source.id;
					this.findSource(me);
				} else if (err === ERR_TIRED && log_minor) {
					console.log("[" + me.name + "] Not enought stamina to move!");
				}
				if (source.pos.inRangeTo(me.pos.x,me.pos.y, state === GOING_TO_SOURCE ? sourceDisdance : sinkDisdance))
					me.memory[this.prefix].state = state === GOING_TO_SOURCE ? COLLECTING : LOADING_OFF;
			}
		}
		else if(state === COLLECTING || state === LOADING_OFF){
			let source = Game.getObjectById(me.memory[this.prefix].target);
			if(source === null){
				console.log("[" + me.name + "] Source dissapered");
				if(state === COLLECTING)
					this.findSource(me);
				else
					this.findTarget(me);
			} else {
				let err = state === COLLECTING ? collectorFunction(me, source) : sinkFunction(me, source);

				if (err !== OK  && !(err === ERR_FULL && state === COLLECTING)) {
					console.log("[" + me.name + "] " + (state === LOADING_OFF ? "Sinking" : "Collecting") + " of " + source.pos + " failed : " + err);
					me.memory[this.prefix].ignore = source.id;
					if (state === COLLECTING)
						this.findTarget(me);
					else
						this.findSource(me);
				}else if(err === ERR_FULL && state === COLLECTING){
				    this.findTarget(me);  
				} else {
					if (state === COLLECTING) {
						if (stopCollectingCondition(me, source)) {
							this.findTarget(me);
						} else if (!lastFilter(me.name)(source, me)) {
							this.findSource(me);
						}
					} else {
						if (stopSinkingCondition(me, source)) {
							this.findSource(me);
						} else if (!lastFilter(me.name)(source, me)) {
							this.findTarget(me);
						}
					}
				}
			}
		}else if(state === SEARCHING_SINK){
			this.findTarget(me);
		}else if(state === SEARCHING_SOURCE){
			this.findSource(me);
		}
		return !me.memory[prefix].idle;
	};

	role.getBody = function(power) {
		let body = [MOVE,CARRY,WORK];
		power -= 200;
		while(power>=200){
			power -= 200;
			body = body.concat([MOVE,CARRY,WORK]);
		}
		return body;
	}
	role.init = function(){
		hivemind = this.hivemind;
		for(let prio of sinkPriority)
			hivemind.setGroupMax(prio.name,prio.hivemindLimit === -1 ? 50 : prio.hivemindLimit);

		for(let prio of sourcePriority)
			hivemind.setGroupMax(prio.name,prio.hivemindLimit === -1 ? 50 : prio.hivemindLimit);
		init();
	};
	return role;
}

