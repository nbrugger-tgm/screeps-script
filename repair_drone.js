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
        name: "Door (Rampart) <10%",
        hivemindLimit: 2,
        type: FIND_STRUCTURES,
        subType: [STRUCTURE_RAMPART],
        filter: (build, me) => (build.hits / build.hitsMax )< 0.1 && build.progressTotal === undefined,
        sorter: (build, me) => (Math.floor(build.hits / 1000) * 1000) + me.pos.getRangeTo(build)
    },{
        name: "Repairable",
        hivemindLimit: 5,
        type: FIND_STRUCTURES,
        filter: (build, me) => build.hits+100 < build.hitsMax && build.progressTotal === undefined,
        sorter: (build, me) => (Math.floor(build.hits / 1000) * 1000) + me.pos.getRangeTo(build)
    },
];
const sourceTable = [
    {
        name: "Storage",
        hivemindLimit: -1,
        type: FIND_STRUCTURES,
        subTypes: [STRUCTURE_STORAGE,STRUCTURE_CONTAINER,STRUCTURE_POWER_BANK],
        filter: (build,me)=>build.store.energy>0,
        sorter: (build,me)=>me.pos.getRangeTo(build)
    }
];
let ticks = 0;
var TransfereRole = require('TransferRole');
module.exports = TransfereRole(
    "repair_drone",
    ["builder"],
    200,
    sinkTable,
    sourceTable,
    3,
    1,
    (me,source)=>me.withdraw(source,RESOURCE_ENERGY),
    (me,source)=>me.repair(source),
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
