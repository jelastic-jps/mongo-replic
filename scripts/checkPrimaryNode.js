//nosqldbNodeGroup
var sTargetAppid = getParam("TARGET_APPID"),
    oNodes = jelastic.env.control.GetEnvInfo(sTargetAppid, session).nodes,
    nodesCount = "${nodes.nosqldb.length}",
    slaveVote = 1,
    obj,
    oResp,
    i, 
    n;

	jelastic.marketplace.console.WriteLog("nodesCount -> " + nodesCount);
for (i = 0, n = nodesCount; i < n; i += 1) {
    java.lang.System.out.println("DEBUG oNodes[i].nodeGroup -> " + oNodes[i].nodeGroup);
    java.lang.System.out.println("DEBUG oNodes[i] -> " + oNodes[i]);
  if (oNodes[i].nodeGroup == nosqldbNodeGroup) {
      
      jelastic.marketplace.console.WriteLog("checkPrimaryNode - oNodes[i].id -> " + oNodes[i].id);
    if (isPrimary(oNodes[i].id) == "true") {
jelastic.marketplace.console.WriteLog("in if -> ");
      oResp = {
          result: 0,
          onAfterReturn: []
      };
      obj = {}; obj[next] = {masterNodeId: oNodes[i].id}
      oResp.onAfterReturn.push(obj);
      break;
    }
  }
}


return oResp || {
  result: 0
}

function isPrimary(nodeId) {
    var cmd;
  
    cmd = [
        "curl -fsSL \"${baseUrl}scripts/isMaster.sh\" -o /tmp/checkMaster.sh", 
        "/bin/bash /tmp/checkMaster.sh | grep ismaster | cut -c 15- | rev | cut -c 2- | rev"
    ];
  
    java.lang.System.out.println("DEBUG checkPrimaryNode isPrimary nodeId -> " + nodeId);
    oResp = exec(nodeId, cmd);
      java.lang.System.out.println("DEBUG oResp - exec -> " + oResp);
    if (!oResp || oResp.result != 0){
        return oResp;
    }
  
    if (oResp.responses) {
        oResp = oResp.responses[0];
    }
    
    return oResp.out;
}

function exec(nodeid, cmd) {
    return jelastic.env.control.ExecCmdById(sTargetAppid, session, nodeid, toJSON([{
      "command": cmd.join("\n")
    }]));
}
