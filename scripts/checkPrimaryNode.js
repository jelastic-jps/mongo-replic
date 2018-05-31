//nosqldbNodeGroup
var sTargetAppid = getParam("TARGET_APPID"),
    oNodes = jelastic.env.control.GetEnvInfo(sTargetAppid, session).nodes,
    slaveVote = 1,
    obj,
    oResp,
    i, 
    n;
for (i = 0, n = oNodes.length; i < n; i += 1) {
  if (oNodes[i].nodeGroup == nosqldbNodeGroup) {
      if (isPrimary(oNodes[i].id)) {

      oResp = {
        result: 0,
        onAfterReturn: []
      };
//       obj = {}; obj[next] = {masterNodeId: oNodes[i].id}
//       oResp.onAfterReturn.push(obj);
	      jelastic.marketplace.console.WriteLog("checkPrimaryNode - oNodes[i].id ->" + oNodes[i].id);
      	jelastic.marketplace.console.WriteLog("checkPrimaryNode - oResp ->" + oResp);
      return oResp;
    }
  }
}


return oResp || {
  result: 0
}

function isPrimary(nodeId) {
    var cmd,
	aCmdResp;
  
    cmd = [
        "curl -fsSL \"${baseUrl}scripts/replicaSet.sh\" -o /tmp/replicaSet.sh", 
        "/bin/bash /tmp/replicaSet.sh --exec=isMaster | grep ismaster | cut -c 15- | rev | cut -c 2- | rev && /bin/bash /tmp/replicaSet.sh --exec=isMaster | grep secondary | cut -c 16- | rev | cut -c 2- | rev"
    ];

    oResp = exec(nodeId, cmd);

    if (!oResp || oResp.result != 0){
        return oResp;
    }
	jelastic.marketplace.console.WriteLog("isPrimary - nodeId->" + nodeId);
  	jelastic.marketplace.console.WriteLog("isPrimary - oResp->" + oResp);
    if (oResp.responses) {
        oResp = oResp.responses[0];
	    
	if (oResp.out) {
	    aCmdResp = oResp.out.replace(/\n/, ",").split(",");
	}
    }
	jelastic.marketplace.console.WriteLog("isPrimary - aCmdResp->" + aCmdResp);
    if (aCmdResp[0] == "true" && aCmdResp[1] == "false") {
        return true;
    }
}

function exec(nodeid, cmd) {
    return jelastic.env.control.ExecCmdById(sTargetAppid, session, nodeid, toJSON([{
      "command": cmd.join("\n")
    }]));
}
