var sTargetAppid = getParam("TARGET_APPID"),
    aNodes = jelastic.env.control.GetEnvInfo(sTargetAppid, session).nodes,
    aNoSQLAddresses = [],
    aReplicaNodes = [],
    sArbiterIp = "",
    nMasterId;

for (var i = 0, n = aNodes.length; i < n; i += 1) {
    if (aNodes[i].nodeGroup == "nosqldb") {
        aNoSQLAddresses.push(String(aNodes[i].address));

        if (!nMasterId) {
            if (isPrimary(aNodes[i].id) == "true") {
                nMasterId = aNodes[i].id;
            }
        }
    }
    
    if (!sArbiterIp && aNodes[i].nodeGroup == "arb") {
        sArbiterIp = aNodes[i].address;
    }
}

if (!nMasterId) {
    //set nosqldb master node primary node
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
aReplicaNodes = aReplicaNodes.filter(
    function(n){ 
        return n != undefined 
    }
); 

for (var i = 0, n = aReplicaNodes.length; i < n; i += 1) {
    var oResp;

    oResp = removeSlave(nMasterId, aReplicaNodes[i]);
    
    if (!oResp || oResp.result != 0){
        return oResp;
    }
}

function removeSlave(masterId, ip) {
    var cmd = [
            "curl -fsSL \"https://raw.githubusercontent.com/dzotic9/mongo-replic/master/scripts/removeSlave.sh\" -o /tmp/removeSlave.sh",
            "/bin/bash /tmp/removeSlave.sh " + ip + ":27017"
        ];

    return exec(masterId, cmd);
}

function isPrimary(nodeId) {
    var cmd;
  
    cmd = [
        "curl -fsSL \"https://raw.githubusercontent.com/dzotic9/mongo-replic/master/scripts/isMaster.sh\" -o /tmp/checkMaster.sh", 
        "/bin/bash /tmp/checkMaster.sh | grep ismaster | cut -c 15- | rev | cut -c 2- | rev"
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
        "curl -fsSL \"https://raw.githubusercontent.com/dzotic9/mongo-replic/master/scripts/getStatus.sh\" -o /tmp/getStatus.sh",
        "bash /tmp/getStatus.sh | grep name"
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

return oResp;
