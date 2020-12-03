/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('settings');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    targetPopulation: {
        harvester: 5,
        builder: 2,
        upgrader: 1,
        //cargo: 0,
        repair_drone: 1,
        supplier: 0
    },
    reha:{
        builder: false,
        upgrader: false,
        repair_drone: false
    },
};