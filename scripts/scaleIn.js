//masterNodeId, nodeGroup
var ARBITER_GROUP = "arb",
    sTargetAppid = getParam("TARGET_APPID"),
    aNodes = jelastic.env.control.GetEnvInfo(sTargetAppid, session).nodes,
    aNoSQLAddresses = [],
    aReplicaNodes = [],
    sArbiterIp = "";

for (var i = 0, n = aNodes.length; i < n; i += 1) {
    if (aNodes[i].nodeGroup == nodeGroup) {
        aNoSQLAddresses.push(String(aNodes[i].address));
    }
    
    if (!sArbiterIp && aNodes[i].nodeGroup == ARBITER_GROUP) {
        sArbiterIp = aNodes[i].address;
    }
}

aReplicaNodes = getReplicaAddresses();

for (var i = 0, n = aReplicaNodes.length; i < n; i += 1) {

    if (aReplicaNodes[i] == sArbiterIp) {
        delete aReplicaNodes[i];
    }

    if (aNoSQLAddresses.indexOf(aReplicaNodes[i]) != -1) {
        delete aReplicaNodes[i];
    }
}
aReplicaNodes = aReplicaNodes.filter(function(n){ 
    return n != undefined 
}); 

jelastic.marketplace.console.WriteLog("aReplicaNodes filtered ->" + aReplicaNodes);

for (var i = 0, n = aReplicaNodes.length; i < n; i += 1) {
    var oResp;
    
    jelastic.marketplace.console.WriteLog("removeSlave - masterNodeId ->" + masterNodeId);
    jelastic.marketplace.console.WriteLog("removeSlave - aReplicaNodes[i] ->" + aReplicaNodes[i]);
    oResp = removeSlave(masterNodeId, aReplicaNodes[i]);
    jelastic.marketplace.console.WriteLog("removeSlave - oResp ->" + oResp);
    if (!oResp || oResp.result != 0){
        return oResp;
    }
}

function removeSlave(masterId, ip) {
    var cmd = [
            "curl -fsSL \"${baseUrl}scripts/replicaSet.sh\" -o /tmp/replicaSet.sh",
            "/bin/bash /tmp/replicaSet.sh --exec=removeSlave --remove=" + ip + ":27017"
        ];

    return exec(masterId, cmd);
}

function isPrimary(nodeId) {
    var cmd;
  
    cmd = [
        "curl -fsSL \"${baseUrl}scripts/replicaSet.sh\" -o /tmp/replicaSet.sh", 
        "/bin/bash /tmp/replicaSet.sh --exec=isMaster | grep ismaster | cut -c 15- | rev | cut -c 2- | rev"
    ];

    oResp = exec(nodeId, cmd);
    
    if (!oResp || oResp.result != 0) {
        return oResp;
    }
  
    if (oResp.responses) {
        oResp = oResp.responses[0];
    }
    
    return oResp.out;
}

function getReplicaAddresses() {
    var cmd,
        oResp,
        aIps = [];
    
    cmd = [
        "curl -fsSL \"${baseUrl}scripts/replicaSet.sh\" -o /tmp/replicaSet.sh",
        "/bin/bash -x /tmp/replicaSet.sh --exec=getStatus | grep name"
    ];

    oResp = exec(${nodes.nosqldb[0].id}, cmd);
    if (!oResp || oResp.result != 0) {
        return oResp;
    }
    
    aIps = oResp.responses[0].out.replace(/.*\"name\" : \"/g, "");
    aIps = aIps.replace(/:27017/g, "");
    aIps = aIps.replace(/\n/g, "").slice(0, -2);
    
    return aIps.split("\",");
}

function exec(nodeid, cmd) {
    return jelastic.env.control.ExecCmdById(sTargetAppid, session, nodeid, toJSON([{
      "command": cmd.join("\n")
    }]));
}

return {
    result: 0
};
