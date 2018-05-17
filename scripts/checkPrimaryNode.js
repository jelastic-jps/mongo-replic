var NOSQL_GROUP = "nosqldb",
    sTargetAppid = getParam("TARGET_APPID"),
    oNodes = jelastic.env.control.GetEnvInfo(sTargetAppid, session).nodes,
    nodesCount = "${nodes.nosqldb.length}",
    slaveVote = 1,
    oResp,
    i, 
    n;
    
for (i = 0, n = nodesCount; i < n; i += 1) {
  if (oNodes[i].nodeGroup == NOSQL_GROUP) {
    if (isPrimary(oNodes[i].id)) {
      return {
        result: 0,
        onAfterReturn: {
            next: {
                masterNodeId: oNodes[i].id
            }
        }
      }
    }
  }
}

function isPrimary(nodeId) {
    var cmd;
  
    cmd = [
        "curl -fsSL \"${baseUrl}scripts/isMaster.sh\" -o /tmp/checkMaster.sh", 
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

return {
  result: 0
}
