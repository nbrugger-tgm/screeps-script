modules.exports = {
    onTick: ()=> {
        for(let room in Game.rooms){
            let towers = Game.rooms[room].find(FIND_MY_STRUCTURES,{filter:(s)=>s.structureType === STRUCTURE_TOWER});
            for(let tower of towers){
                let targets = tower.room.find(FIND_HOSTILE_CREEPS);
                if(targets.length !== 0){
                    targets = _.sortBy(targets,(s)=>tower.pos.getRangeTo(s));
                    tower.attack(targets[0]);
                    continue;
                }
                targets = tower.room.find(FIND_MY_CREEPS,{filter:(c)=>c.hits<c.hitsMax});
                if(targets.length !== 0){
                    targets = _.sortBy(targets,(s)=>tower.pos.getRangeTo(s));
                    tower.heal(targets[0]);
                    continue;
                }
                targets = tower.room.find(FIND_MY_STRUCTURES,{filter:(c)=>c.hits<c.hitsMax});
                if(targets.length !== 0){
                    targets = _.sortBy(targets,(s)=>tower.pos.getRangeTo(s));
                    tower.repair(targets[0]);
                }
            }
        }
    }
}