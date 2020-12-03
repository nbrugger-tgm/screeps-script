/*
* Module code goes here. Use 'module.exports' to export things:
* module.exports.thing = 'a thing';
*
* You can import it from another modules like this:
* var mod = require('harvester');
* mod.thing == 'a thing'; // true
*/
const GROUPS = require("constants").GROUPS;
const sinkTable = [
    {
        name: GROUPS.SPAWN,
        type: FIND_MY_STRUCTURES,
        subTypes: [STRUCTURE_SPAWN,STRUCTURE_EXTENSION],
        filter: (build,me)=>build.store.getFreeCapacity(RESOURCE_ENERGY)>0,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    },
    {
        name: GROUPS.STORAGE,
        type: FIND_STRUCTURES,
        subTypes: [STRUCTURE_CONTAINER,STRUCTURE_STORAGE],
        filter: (build,me)=>build.store.getFreeCapacity(RESOURCE_ENERGY)>0,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    },
    {
        name: GROUPS.TOWER,
        hivemindLimit: 4,
        type: FIND_MY_STRUCTURES,
        subTypes: [STRUCTURE_TOWER],
        filter: (build,me)=>build.store.getFreeCapacity(RESOURCE_ENERGY)>0,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    }
];
const sourceTable = [
    {
        name: GROUPS.SOURCE,
        hivemindLimit: 3,
        type: FIND_SOURCES_ACTIVE,
        filter: (build,me)=>true,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    }
];

var TransfereRole = require('TransferRole');
module.exports = TransfereRole(
    "harvester",
    ["builder"],
    200,
    sinkTable,
    sourceTable,
    1,
    1,
    (me,source)=>me.harvest(source),
    (me,source)=>me.transfer(source,RESOURCE_ENERGY),
    (me,source)=>me.store.energy === 0,
    (me,source)=>me.store.getFreeCapacity(RESOURCE_ENERGY)===0|| source.energy === 0);
module.exports.getBody = function(power) {
    var body = [CARRY,MOVE,WORK];
    power -= 200;
    while(power >= 150){
        body.push(WORK)
        body.push(MOVE);
        power -= 150;
        if(power >= 100){
            body.push(MOVE);
            body.push(CARRY);
            power -= 100;
        }
    }
    return body;
}