//newNodeIp, masterNodeId
var sTargetAppid = getParam("TARGET_APPID"),
    oEnv = jelastic.env.control.GetEnvInfo(sTargetAppid, session),
    aNodes = oEnv.nodes,
    oResp;

oResp = addSlave(Number(masterNodeId), newNodeIp);
if (!oResp || oResp.result != 0){
    return oResp;
}

function addSlave(masterNodeId, newNodeIp) {
    var nodesCount = "${nodes.nosqldb.length}",
        newIpAddress,
        priority = 1,
        cmd;
    
    newIpAddress = newNodeIp || "${nodes.nosqldb.last.address}";
    
    if ((Number(nodesCount)) >= 7) {
        priority = 0;
    }
    
    cmd = [
        "curl -fsSL \"${baseUrl}scripts/addSlave.sh\" -o /tmp/addSlave.sh",
        "/bin/bash /tmp/addSlave.sh " + newIpAddress + " " + priority
    ];

    return exec(masterNodeId, cmd);
}

function exec(nodeid, cmd) {
    return jelastic.env.control.ExecCmdById(sTargetAppid, session, nodeid, toJSON([{
      "command": cmd.join("\n")
    }]));
}

return {
    result: 0,
    response: oResp
};
