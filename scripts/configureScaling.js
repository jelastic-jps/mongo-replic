var sTargetAppid = getParam("TARGET_APPID"),
    oEnv = jelastic.env.control.GetEnvInfo(sTargetAppid, session),
    aNodes = oEnv.nodes,
    oResp;

function isPrimary(nodeId) {
    var cmd;
  
    cmd = [
        "curl -fsSL \"https://raw.githubusercontent.com/dzotic9/mongo-replic/master/scripts/isMaster.sh\" -o /tmp/checkMaster.sh", 
        "/bin/bash /tmp/checkMaster.sh | grep ismaster | cut -c 15- | rev | cut -c 2- | rev"
    ];
  java.lang.System.out.println("DEBUG - in isPrimary - nodeId -> " + nodeId);
    oResp = exec(nodeId, cmd);
    java.lang.System.out.println("DEBUG - in isPrimary - oResp -> " + oResp);
    
    if (!oResp || oResp.result != 0){
        return oResp;
    }
  
    if (oResp.responses) {
        oResp = oResp.responses[0];
    }
    
    return oResp.out;
}

function addSlave(nodeId) {
    var cmd = [
            "curl -fsSL \"https://raw.githubusercontent.com/dzotic9/mongo-replic/master/scripts/addSlave.sh\" -o /tmp/addSlave.sh",
            "/bin/bash /tmp/addSlave.sh ${nodes.nosqldb.last.address}"
        ];
    
    java.lang.System.out.println("DEBUG - in isPrimary -> ");
    return exec(nodeId, cmd);
}

function exec(nodeid, cmd) {
    return jelastic.env.control.ExecCmdById(sTargetAppid, session, nodeid, toJSON([{
      "command": cmd.join("\n")
    }]));
}

for (var i = 0, n = aNodes.length; i < n; i += 1) {
    java.lang.System.out.println("DEBUG - in for - aNodes[i].nodeGroup -> " + aNodes[i].nodeGroup);
    if (aNodes[i].nodeGroup == "nosqldb") {
        java.lang.System.out.println("DEBUG - in if -> ");
        if (isPrimary(aNodes[i].id) == "true") {
            oResp = addSlave(aNodes[i].id);

            java.lang.System.out.println("DEBUG - in for - addSlave - oResp -> " + oResp);
            if (!oResp || oResp.result != 0){
                return oResp;
            }
        }
    }
}

return oResp;
