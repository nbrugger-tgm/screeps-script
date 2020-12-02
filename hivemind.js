function Hivemind() {
    this.data= {};
    this.maxVals = {};
    this.setGroupMax = (group,max)=>{
        (this.maxVals)[group] = max;
    }
    this.addLock = (group,id)=>{
        if((this.data)[group] === undefined){
            (this.data)[group] = {};
        }
        if((this.data)[group][id] === undefined || this.data[group][id] === null){
            (this.data)[group][id] = 1;
        }else{
            (this.data)[group][id] += 1;
        }
    }
    this.releaseLock = (group,id)=>{
        if(this.data[group] === undefined) return;
        if(this.data[group][id] === undefined) return;
        (this.data)[group][id] -= 1;
    }
    this.isFree = (group,id)=>{
        if(this.data[group] === undefined) return true;
        if(this.data[group][id] === undefined || this.data[group][id] === null) return true;
        //console.log("IS FREE : "+group+"/"+id+" = "+((this.data)[group][id] < (this.maxVals[group] === undefined ? 8 : this.maxVals[group])));
        return (this.data)[group][id] < (this.maxVals[group] === undefined ? 8 : this.maxVals[group]);
    }
    this.CONTAINERS = "containers";
    this.SOURCES = "sources";
}
module.exports = Hivemind;