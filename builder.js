/*
* Module code goes here. Use 'module.exports' to export things:
* module.exports.thing = 'a thing';
*
* You can import it from another modules like this:
* var mod = require('harvester');
* mod.thing == 'a thing'; // true
*/
const sinkTable = [
    {
        name: "Base WALL",
        hivemindLimit: 10,
        type: FIND_MY_CONSTRUCTION_SITES,
        subTypes: [STRUCTURE_WALL],
        filter: (build,me)=>true,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    },
    {
        name: "Containers",
        hivemindLimit: 10,
        type: FIND_MY_CONSTRUCTION_SITES,
        subTypes: [STRUCTURE_CONTAINER],
        filter: (build,me)=>me.memory.storeless,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    },
    {
        name: "Extensions",
        hivemindLimit: 10,
        type: FIND_MY_CONSTRUCTION_SITES,
        filter: (build)=>build.structureType === STRUCTURE_EXTENSION,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    },
    {
        name: "ConstructionSite",
        hivemindLimit: 10,
        type: FIND_MY_CONSTRUCTION_SITES,
        filter: ()=>true,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    }
];
const sourceTable = [
    {
        name: "Spawn",
        hivemindLimit: -1,
        type: FIND_MY_STRUCTURES,
        subTypes: [STRUCTURE_SPAWN],
        filter: (build,me)=>me.memory.storeless,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    },
    {
        name: "Storage",
        hivemindLimit: -1,
        type: FIND_STRUCTURES,
        subTypes: [STRUCTURE_STORAGE,STRUCTURE_CONTAINER,STRUCTURE_POWER_BANK],
        filter: (build,me)=>build.store.energy>me.carryCapacity,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    }
];

var TransfereRole = require('TransferRole');
module.exports = TransfereRole(
    "builder",
    ["repair_drone","harvester"],
    200,
    sinkTable,
    sourceTable,
    3,
    1,
    (me,source)=>me.withdraw(source,RESOURCE_ENERGY),
    (me,source)=>me.build(source),
    (me,source)=>me.carry.energy === 0,
    (me,source)=>me.carry.getFreeCapacity(RESOURCE_ENERGY)===0||source.store.energy === 0);
module.exports.getBody = function(power) {
    var body = [CARRY,MOVE,WORK];
    power -= 200;
    while(power >= 100){
       body.push(CARRY)
       body.push(MOVE);
       power -= 100;
       if(power >= 150){
           body.push(MOVE);
           body.push(WORK);
           power -= 150;
       }
    }
    return body;
}
