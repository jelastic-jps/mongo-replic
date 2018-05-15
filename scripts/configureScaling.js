var sTargetAppid = getParam("TARGET_APPID"),
    oEnv = jelastic.env.control.GetEnvInfo(sTargetAppid, session),
    nodesCount = "${nodes.nosqldb.length}",
    aNodes = oEnv.nodes,
    slaveVote = 1,
    oResp;

function isPrimary(nodeId) {
    var cmd;
  
    cmd = [
        "curl -fsSL \"https://raw.githubusercontent.com/dzotic9/mongo-replic/master/scripts/isMaster.sh\" -o /tmp/checkMaster.sh", 
        "/bin/bash /tmp/checkMaster.sh | grep ismaster | cut -c 15- | rev | cut -c 2- | rev"
    ];
  
    oResp = exec(nodeId, cmd);
      
    if (!oResp || oResp.result != 0){
        return oResp;
    }
  
    if (oResp.responses) {
        oResp = oResp.responses[0];
    }
    
    return oResp.out;
}

function addSlave(nodeId, priority) {
    var cmd,
        newIpAddress;
        
    newIpAddress = newNode || "${nodes.nosqldb.last.address}";
    cmd = [
            "curl -fsSL \"https://raw.githubusercontent.com/dzotic9/mongo-replic/master/scripts/addSlave.sh\" -o /tmp/addSlave.sh",
            "/bin/bash /tmp/addSlave.sh " + newIpAddress + " " + priority
        ];

    return exec(nodeId, cmd);
}

function exec(nodeid, cmd) {
    return jelastic.env.control.ExecCmdById(sTargetAppid, session, nodeid, toJSON([{
      "command": cmd.join("\n")
    }]));
}

for (var i = 0, n = aNodes.length; i < n; i += 1) {

    if (aNodes[i].nodeGroup == "nosqldb") {
        if (isPrimary(aNodes[i].id) == "true") {
            
            if ((Number(nodesCount) + Number("${event.response.nodes.length}")) >= 7) {
                slaveVote = 0;
            }

            oResp = addSlave(Number(aNodes[i].id), slaveVote);
            if (!oResp || oResp.result != 0){
                return oResp;
            }
        }
    }
}
return {
    result: 0,
    response: oResp
};
