/* Copyright SylvanRah 2021 */

// TODO unicode symbols that look like laying, and sleeping deer

"use strict";

function SylTefMap(){
  /* Configurables */
  const entityHoverScaleFactor = 2;
  //const entityPlayerSizePercentage = 4.5;
  const entityPlayerSizePercentage = 5.1;
  //const minProximityCoef = 0.7;
  const minProximityCoef = 0.61;
  const maxUserPageTries = 10;
  
  const previewWidth = 45;
  //const previewHeight = 45;
  const previewLoadingText = "Loading Biography Preview... <br />\
  You may click to go right away. Most of the time this will take you\
  to the player page, unless there is another post with the same name\
  or they haven't created a page yet.";
  
  const playerSleepingStatusText = "Zzz...";
  const playerSleepingStatusTextSize = "65%";
  const playerSleepingStatusColor = "#773776";
  
  const playerDancingStatusText = "&#9835;";
  const playerDancingStatusTextSize = "100%";
  const playerDancingStatusColor = "#47CB47";
  
  const updateDelaySeconds = 30;
  const dataOldThresholdSeconds = 120;
  
  /* Objects */
  function EntityGroup(){
    if(!(this instanceof EntityGroup)){
      throw new Error("EntityGroup constructor called as a function");
    }
    this.mouseEnterFunc = null;
    this.mouseLeaveFunc = null;
    this.centerElem = null;
    this.centerRadius = 0;
    this.xCentroid = 0;
    this.yCentroid = 0;
    this.entities = [];
  }
  
  const ParticipantType = Object.freeze({
    NONE: 1,
    JUDGE: 2,
    COMPETITOR: 3,
    CHALLENGER: 4,
    WILDCARD: 5
  });
  
  function PlayerData(){
    if(!(this instanceof PlayerData)){
      throw new Error("PlayerData constructor called as a function");
    }
    this.pictoWord = "";
    this.generationNumber = 0;
    this.participantType = ParticipantType.NONE;
    this.state = 0;
    this.userPageUrl = "";
    this.userPageLinkElem = null;
    this.userDetailText = "";
    //this.userDetailHeight = 0;
    this.statusElem = null;
    this.glyphElems = [];
    //this.glyphCols = [];
    this.glyphRows = [];
  }
  
  function GenericData(){
    if(!(this instanceof GenericData)){
      throw new Error("GenericData constructor called as a function");
    }
    this.elemHtml = "";
  }
  
  const EntityType = Object.freeze({
    PLAYER: 1,
    GENERIC: 2
  });
  
  function MapEntity(){
    if(!(this instanceof MapEntity)){
      throw new Error("MapEntity constructor called as a function");
    }
    this.isNew = true;
    this.isCurrent = true;
    this.isInteractive = false;
    this.width = 0;
    this.height = 0;
    this.x = 0;
    this.y = 0;
    this.xHoverOffset = 0;
    this.yHoverOffset = 0;
    this.group = null;
    this.elem = null;
    this.type = EntityType.GENERIC;
    this.data = null;
  }
  
  /* Constants */
  const participantMap = new Map();
 
  
  // test userpage walk with "Dal0"
  
  
  const glyphColWidth = 100; // 100 / 14
  const glyphRowHeight = 100 / (15 * 4 - 1); // 100 / 7
  /*
  const glyphLetters = {
    gen1: [
      "abcdefghijklmno",
      "abcdpqrstuvwxyz",
      "efghijklmnopqrs",
      "tuvwxyz01234567"
    ],
    gen2: [
      "abcdefghijklmno",
      "abcdpqrstuvwxyz",
      "efghijklmnopqrs",
      "tuvwxyz01234567"
    ],
    gen3: [
      "abcdefghijklmno",
      "abcdpqrstuvwxyz",
      "efghijklmnopqrs",
      "tuvwxyz01234567"
    ],
    gen4: [
      "abcdefghijklmno",
      "pqrstuvwxyzabcd",
      "efghijklmnopqrs",
      "tuvwxyz01234567"
    ],
    gen5: [
      "abcdefghijklmno",
      "pqrstuvwxyzabcd",
      "efghijklmnopqrs",
      "tuvwxyz01234567"
    ]
  };
  */
  /* Variables */
  let previewDisplaySettingElem = null;
  
  let mapElem = null;
  let serverErrorElem = null;
  let playerCountElem = null;
  let updateTimeout = null;
  
  let mapEntites = [];
  let mapEntityGroups = [];
  let mapGroupEscapeFunc = null;
  let lastHoveredEntity = null;
  let tryHoverEntity = null;
  let lastHoveredGroup = null;
  let tryHoverGroup = null;
  let glyphImageUrls = [];
  let playerCount = 0;
  
  let doDisplayPlayerPreview = true;
  let playerPreviewElem = null;
  let playerPreviewTextElem = null;
  
  let getPlayersUrl = "";
  let playerPageUrl = "";
  let playerPageTarget = "";
  
  let findPlayerPageQueue = new Promise((resolve, reject) => {resolve()});
  
  let previewShowHideQueue = new Promise((resolve, reject) => {resolve()});
  
  /* Functions */
  function logError(errorString){
    console.log(errorString);
  }
  
  function writeErrorToElem(elem, errorString){
    elem.innerHTML = errorString.replaceAll("\n", "\n<br />\n");
    logError(errorString);
  }
  
  function appendErrorToElem(elem, errorString){
    elem.innerHTML += errorString.replaceAll("\n", "\n<br />\n");
    logError(errorString);
  }
  
  function clearErrorElem(elem){
    elem.innerHTML = "";
  }

  function displayErrorfallback(errorString){
    try{
      const scriptLoaderElem = document.getElementById(
        "syl_tef_map_script_invocation"
      );
      const blogBodyElem = scriptLoaderElem.parentElement;
      const errorElem = document.createElement("div");
      errorElem.style.width = "100%";
      errorElem.style.textAlign = "center";
      appendErrorToElem(errorElem, errorString + 
        "\nNice error-display box not found"
      );
      blogBodyElem.insertBefore(errorElem, scriptLoaderElem);
    }catch(e){
      logError(errorString);
      logError("Nice error-display box not found");
      logError("Fallback error-display box not found");
      logError(e);
    }
  }

  function displayErrorNice(errorString){
    try{
      mapElem = document.getElementById("syl_map");
      // TODO select a child elem once made
      writeErrorToElem(mapElem, errorString);
    }catch(e){
      displayErrorfallback(errorString);
    }
  }

  function displayErrorExeption(e){
    const errorString = e + ".\tLine " + e.lineNumber;
    displayErrorNice(errorString);
  }
  
  function writeServerError(errorString){
    writeErrorToElem(serverErrorElem, errorString);
  }
  
  function clearServerError(){
    serverErrorElem.innerHTML = "";
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  function mapXtoPercentage(mapX){
    const mapBoundsMinX = -160;
    const mapBoundsMaxX = 480;
    const mapWidth = mapBoundsMaxX - mapBoundsMinX;
    return ((mapX - mapBoundsMinX) * 100) / mapWidth;
  }
  
  function mapZtoPercentage(mapZ){
    const mapBoundsMinZ = -160;
    const mapBoundsMaxZ = 480;
    const mapHeight = mapBoundsMaxZ - mapBoundsMinZ;
    return 100 - ((mapZ - mapBoundsMinZ) * 100) / mapHeight;
  }
  
  function requirePageIdElem(id){
    const elem = document.getElementById(id);
    if(!elem){
      throw new Error("Page div missing! Required id: " + id);
    }
    return elem;
  }

  // function requestHttp(url, successCallback, errorCallback, noCache = false){
  //   let xhr = null;
  //   if(window.XMLHttpRequest){
  //     xhr = new XMLHttpRequest();
  //   }else{
  //     xhr = new ActiveXObject("Microsoft.XMLHTTP");
  //   }
    
  //   xhr.onreadystatechange = () => {
  //     try{
  //       if(xhr.readyState == 4){
  //         var status = xhr.status;
  //         if(status >= 200 && status < 400 && xhr.HEADERS_RECEIVED){
  //           successCallback(xhr);
  //         }else{
  //           logError("Problem connecting to " + url + ". Status: " + status);
  //           errorCallback(xhr);
  //         }
  //       }
  //     }catch(e){
  //       displayErrorExeption(e);
  //     }
  //   };
  //   xhr.ontimeout = () => {
  //     logError("Connection to " + url + "Timed out.");
  //     errorCallback(xhr);
  //   };
  //   xhr.open("GET", url, true);
  //   if(noCache){
  //     xhr.setRequestHeader(
  //       "Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"
  //     );
  //     xhr.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
  //     xhr.setRequestHeader("Pragma", "no-cache");
  //   }
  //   //xhr.timeout = 2 * 1000;
  //   xhr.send();
  // }
  
  function readDivDatasetUrl(divId){
    const elem = requirePageIdElem(divId);
    return elem.dataset.url;
  }
  
  function ensureWwwOrigin(){
    const hostName = window.location.hostname;
    if(hostName.indexOf("www.") < 0){
      window.location.hostname = "www." + hostName;
    }
  }
  
  function initFindPageElems(){
    mapElem = requirePageIdElem("syl_map");
    serverErrorElem = requirePageIdElem("syl_map_error_box");
    
    getPlayersUrl = readDivDatasetUrl("syl_get_players_source");
    playerPageUrl = readDivDatasetUrl("syl_player_page_source");
    playerPageTarget = readDivDatasetUrl("syl_player_page_target");
    
    playerPreviewElem = requirePageIdElem("syl_player_preview_container");
    playerCountElem = requirePageIdElem("syl_player_count");
    previewDisplaySettingElem = requirePageIdElem("syl_setting_preview");
    
    const previewElem = requirePageIdElem("syl_player_preview");
    const previewTextElems = previewElem.getElementsByClassName("text");
    if(previewTextElems.length < 1){
      throw new Error("Player Preview class missing! Required class: text");
    }
    playerPreviewTextElem = previewTextElems[0];
  }
  
  function getSettings(){
    doDisplayPlayerPreview = true;
    let urlHash = window.location.hash;
    if(urlHash.indexOf("hidePreview_") >= 0){
      doDisplayPlayerPreview = false;
      previewDisplaySettingElem.innerHTML = "Show Biography Previews";
    }else{
      previewDisplaySettingElem.innerHTML = "Hide Biography Previews";
    }
  }
  
  function setSettings(){
    let newUrlHash = "#";
    newUrlHash += "temp_";
    if(!doDisplayPlayerPreview){
      newUrlHash += "hidePreview_";
    }
    window.location.hash = newUrlHash;
  }
  
  function initElems(){
    let previewStyle = playerPreviewElem.style;
    previewStyle.display = "none";
    previewStyle.width = previewWidth + "%";
    //previewStyle.height = previewHeight + "%";
    
    previewDisplaySettingElem.style.cursor = "default";
    previewDisplaySettingElem.onclick = function(){
      doDisplayPlayerPreview = !doDisplayPlayerPreview;
      setSettings();
      getSettings();
    };
  }
  
  function initMapGroupEscape(){
    document.addEventListener("keydown", function(event){
      if(event.key == "Escape"){
        if(mapGroupEscapeFunc != null){
          mapGroupEscapeFunc();
        }
      }
    });
  }
  
  function newMapEntityClass(x, y, width, height, className){
    let entity = new MapEntity();
    entity.isNew = true;
    entity.isCurrent = true;
    entity.isInteractive = false;
    entity.width = width;
    entity.height = height;
    entity.x = mapXtoPercentage(x);
    entity.y = mapZtoPercentage(y);
    entity.type = EntityType.GENERIC;
    let data = new GenericData();
    let elem = document.createElement("div");
    elem.className = className;
    data.elemHtml = elem.outerHTML;
    entity.data = data;
    return entity;
  }
  
  function addInitialMapEntities(){
    const locationSize = 6.5;
    mapEntites.push(newMapEntityClass(
      0, 0, locationSize, locationSize, "syl_map_location ename"
    ));
    mapEntites.push(newMapEntityClass(
      -50, 365, locationSize, locationSize, "syl_map_location de_drinkplaats"
    ));
    mapEntites.push(newMapEntityClass(
      325, 395, locationSize, locationSize, "syl_map_location playground"
    ));
    mapEntites.push(newMapEntityClass(
      305, -5, locationSize, locationSize, "syl_map_location pond"
    ));
    mapEntites.push(newMapEntityClass(
      180, -60, locationSize, locationSize, "syl_map_location oak"
    ));
    mapEntites.push(newMapEntityClass(
      395, -95, locationSize, locationSize, "syl_map_location twin_gods"
    ));
  }
  
  function initMap(){
    ensureWwwOrigin();
    
    initFindPageElems();
    
    getSettings();
    initElems();
    initMapGroupEscape();
    
    addInitialMapEntities();
  }
  
  // Not yet tested in other timezones
  function dateFromPlayerTime(playerTime){
    const year = parseInt(playerTime.substring(0, 4));
    const month = parseInt(playerTime.substring(4, 6));
    const day = parseInt(playerTime.substring(6, 8));
    const hour = parseInt(playerTime.substring(8, 10));
    const minute = parseInt(playerTime.substring(10, 12));
    const second = parseInt(playerTime.substring(12, 14));
    //const date = new Date(year, month - 1, day, hour, minute, second);
    let date = new Date();
    date.setUTCFullYear(year);
    date.setUTCMonth(month - 1, day);
    date.setUTCHours(hour - 1); // string is always in the form UTC - 1
    date.setUTCMinutes(minute);
    date.setUTCSeconds(second);
    return date;
  }
  
  function dataOutOfDateMessage(dataAge){
    let duration = "";
    let addDuration = function(value, unit){
      if(value > 0){
        if(duration != ""){
          duration += ", ";
        }
        duration += value + " " + unit;
        if(value > 1){
          duration += "s";
        }
      }
    };
    const days = Math.floor(dataAge.getTime() / (1000 * 60 * 60 * 24));
    addDuration(days, "day");
    const hours = dataAge.getUTCHours();
    addDuration(hours, "hour");
    const minutes = dataAge.getUTCMinutes();
    addDuration(minutes, "minute");
    writeServerError(
      "Player data has been unavailable for \n" + duration + "."
    );
  }
  
  function checkPlayerDataAge(playerList){
    try{
      const player = playerList.querySelector("player");
      const playerTime = player.getAttribute("playertime");
      
      const playerDate = dateFromPlayerTime(playerTime);
      const currentDate = new Date();
      const dataAge = new Date(currentDate.getTime() - playerDate.getTime());
      if(dataAge.getTime() >= dataOldThresholdSeconds * 1000){
        dataOutOfDateMessage(dataAge);
      }else{
        serverErrorElem.innerHTML = "";
      }
    }catch(e){
      displayErrorExeption(e);
      return;
    }
  }
  
  function setParticipantType(data, picto){
    data.participantType = ParticipantType.NONE;
    const role = participantMap.get(picto);
    if(role){
      data.participantType = role;
    }
    return 0;
  }
  
  function newPlayerData(picto, state){
    let data = new PlayerData();
    data.pictoWord = picto;
    data.state = state;
    data.userDetailText = previewLoadingText;
    //data.userDetailHeight =  // This needs fixing
    data.userPageUrl = playerPageUrl + picto;
    
    let generationNumber = 0;
    let glyphWord;
    let numberOfLetters = picto.length;
    if(numberOfLetters == 4){
      glyphWord = picto.substring(0,4); //.toLowerCase();
      generationNumber = 1;
    }else if(numberOfLetters == 5){
      glyphWord = picto.substring(1,5); //.toLowerCase();
      generationNumber = parseInt(picto.charAt(0)) + 1;
    }else{
      throw new Error("Error: picto formatting not recognised");
    }
    
    if(generationNumber < 1 || generationNumber > 5){
      throw new Error("Error: picto generateion number out of range");
    }
    data.generationNumber = generationNumber;
    /*
    let letters = glyphLetters["gen" + generationNumber];
    
    for(let i = 0; i < 4; i++){
      let col = glyphColWidth * letters[i].indexOf(glyphWord.charAt(i));
      data.glyphCols.push(col);
    }
    */
    for(let i = 0; i < 4; i++){
      const charCode = glyphWord.charCodeAt(i);
      let index = -1;
      if(charCode >= "A".charCodeAt(0)){
        if(charCode >= "a".charCodeAt(0)){
          index = charCode - "a".charCodeAt(0) + 34;
        }else{
          index = charCode - "A".charCodeAt(0) + 8;
        }
      }else{
        index = charCode - "0".charCodeAt(0);
      }
      let row = index;
      data.glyphRows.push(row);
    }
    
    setParticipantType(data, picto);
    
    return data;
  }
  
  function updatePlayerEntities(playerList){
    for(let entity of mapEntites){
      if(entity.type == EntityType.PLAYER){
        entity.isCurrent = false;
      }
    }
    
    const players = playerList.querySelectorAll("player");
    Array.prototype.forEach.call(players, (player) => {
      const picto = player.getAttribute("pictogram");
      const x = mapXtoPercentage(player.getAttribute("posX"));
      const y = mapZtoPercentage(player.getAttribute("posZ"));
      
      const state = parseInt(player.getAttribute("playerstate"));
      let playerIsFound = false;
      for(let entity of mapEntites){
        if(entity.type == EntityType.PLAYER){
          if(entity.data.pictoWord == picto){
            if(!entity.isCurrent){
              entity.isNew = false;
              entity.isCurrent = true;
              entity.x = x;
              entity.y = y;
              entity.data.state = state;
              playerIsFound = true;
            }else if(entity.x == x && entity.y == y){
              playerIsFound = true;
            }
          }
        }
        if(playerIsFound){
          break;
        }
      }
      
      if(!playerIsFound){
        let newEntity = new MapEntity();
        newEntity.isNew = true;
        newEntity.isCurrent = true;
        newEntity.isInteractive = true;
        newEntity.width = entityPlayerSizePercentage;
        newEntity.height = entityPlayerSizePercentage;
        newEntity.x = x;
        newEntity.y = y;
        newEntity.type = EntityType.PLAYER;
        newEntity.data = newPlayerData(picto, state);
        mapEntites.push(newEntity);
      }
    });
  }
  
  function removeOldEntities(){
    for(let [index, entity] of mapEntites.entries()){
      if(!entity.isCurrent){
        const elem = entity.elem;
        if(elem && elem.parentElement){
          elem.parentElement.removeChild(elem);
        }
        entity.data = null;
        mapEntites.splice(index, 1);
        if(lastHoveredEntity == entity){
          lastHoveredEntity = null;
        }
      }
    }
  }
  
  function updateEntityGroups(){
    mapEntityGroups = [];
    for(let thisEntity of mapEntites){
      if(thisEntity.isInteractive){
        let isGrouped = false;
        let closestGroup = null;
        let closestDistSqr = 2 * 100 * 100;
        for(let group of mapEntityGroups){
          for(let oldEntity of group.entities){
            const dx = thisEntity.x - oldEntity.x;
            const dy = thisEntity.y - oldEntity.y;
            const xProximity = (thisEntity.width + oldEntity.width)
              * 0.5 * minProximityCoef;
            const yProximity = (thisEntity.height + oldEntity.height)
              * 0.5 * minProximityCoef;
            if(Math.abs(dx) < xProximity && Math.abs(dy) < yProximity){
              const distSqr = dx * dx + dy * dy;
              if(distSqr < closestDistSqr){
                closestDistSqr = distSqr;
                closestGroup = group;
                isGrouped = true;
              }
            }
          }
        }
        
        if(isGrouped){
          closestGroup.entities.push(thisEntity);
          thisEntity.group = closestGroup;
        }else{
          let newGroup = new EntityGroup();
          newGroup.entities.push(thisEntity);
          mapEntityGroups.push(newGroup);
          thisEntity.group = newGroup;
        }
      }
    }
  }
  
  function calculateHoverOffsets(){
    for(let group of mapEntityGroups){
      const itemCount = group.entities.length;
      
      let xCentroid = 0;
      let yCentroid = 0;
      let size = 0;
      for(let entity of group.entities){
        xCentroid += entity.x;
        yCentroid += entity.y;
        size += entity.width + entity.height;
      }
      xCentroid /= itemCount;
      yCentroid /= itemCount;
      size /= (2 * itemCount);
      /* What follows fell out of the paper working and is not readable*/
      
      const separation = ((1 + entityHoverScaleFactor) * 0.5)
        * size * 0.5 * 1.1;
      
      let t1 = 0;
      let t2 = 2 * Math.PI;
      let tk = (t2 - t1) / (2 * itemCount);
      let radius = 0;
      if(itemCount > 1){
        /* I cannot find or derive an analytical form for radius of a circle
        given arc length and distance to line(s), so this nicely converging
        iterative function will do for now. Any mathematicians, please @ me! 
        It's an interesting problem.
        TODO: visually derive an approximation function s.t radius 
        stays closely above the true value.
        */
        const iterateRadius = function(x, y, r){
          let t1 = 0;
          let t2 = 2 * Math.PI;
          const semiSize = size * 0.5;
          const leftDist = x - semiSize;
          const rightDist = 100 - x - semiSize;
          const topDist = y - semiSize;
          const bottomDist = 100 - y - semiSize;
          
          if(leftDist < r){
            if(topDist < r){
              t1 = Math.PI * 0.5 + Math.acos(leftDist / r);
              t2 = Math.PI * 2 - Math.acos(topDist / r);
            }else if(bottomDist < r){
              t1 = Math.PI + Math.acos(bottomDist / r);
              t2 = Math.PI * 2.5 - Math.acos(leftDist / r);
            }else{
              t1 = Math.PI * 0.5 + Math.acos(leftDist / r);
              t2 = Math.PI * 2.5 - Math.acos(leftDist / r);
            }
          }else if(rightDist < r){
            if(topDist < r){
              t1 = Math.acos(topDist / r);
              t2 = Math.PI * 1.5 - Math.acos(rightDist / r);
            }else if(bottomDist < r){
              t1 = -Math.PI * 0.5 + Math.acos(rightDist / r);
              t2 = Math.PI - Math.acos(bottomDist / r);
            }else{
              t1 = -Math.PI * 0.5 + Math.acos(rightDist / r);
              t2 = Math.PI * 1.5 - Math.acos(rightDist / r);
            }
          }else if(topDist < r){
            t1 = Math.acos(topDist / r);
            t2 = Math.PI * 2 - Math.acos(topDist / r);
          }else if(bottomDist < r){
            t1 = Math.PI + Math.acos(bottomDist / r);
            t2 = Math.PI * 3 - Math.acos(bottomDist / r);
          }
          return {t1: t1, t2: t2};
        };
        radius = separation / Math.sin(tk);
        /* Rather than iterate arbitrarily far until some small epsilon, 
        we'll do this compromise. */
        for(let i = 0; i < 2 + itemCount * 0.4; i++){
          let tNew = iterateRadius(xCentroid, yCentroid, radius);
          t1 = tNew.t1;
          t2 = tNew.t2;
          let tt = t2 - t1;
          tk = tt / (2 * itemCount);
          radius = separation / Math.sin(tk);
        }
      }
      const dt = tk * 2;
      let t = t1 + dt * 0.5;
      let dxMax = 0;
      let dyMax = 0;
      
      // TODO: Problems near edges; minor logic error with dx, dy
      for(let entity of group.entities){
        const xTransform1 = -Math.sin(t) * radius + (xCentroid - entity.x);
        const yTransform1 = -Math.cos(t) * radius + (yCentroid - entity.y);
        
        const xPadding = entity.width * entityHoverScaleFactor * 0.5 * 1.1;
        const xTransform2 = Math.min(
          Math.max(xTransform1 + entity.x, xPadding), 
          100 - xPadding
        ) - entity.x;
        const yPadding = entity.height * entityHoverScaleFactor * 0.5 * 1.1;
        const yTransform2 = Math.min(
          Math.max(yTransform1 + entity.y, yPadding), 
          100 - yPadding
        ) - entity.y;
        
        t += dt;
        const dx = xTransform2 - xTransform1;
        const dy = yTransform2 - yTransform1;
        if(Math.abs(dx) > Math.abs(dxMax)){
          dxMax = dx;
        }
        if(Math.abs(dy) > Math.abs(dyMax)){
          dyMax = dy;
        }
        
        entity.xHoverOffset = xTransform2;
        entity.yHoverOffset = yTransform2;
      }
      
      for(let entity of group.entities){
        entity.xHoverOffset *= 100 / entity.width;
        entity.yHoverOffset *= 100 / entity.height;
      }
      
      group.centerRadius = radius + 
        size * 1.2 + 
        Math.sqrt(dxMax * dxMax + dyMax * dyMax);
      group.xCentroid = xCentroid;
      group.yCentroid = yCentroid;
    }
  }

  function updateMapEntities(xhr){
    let playerList = document.createElement("html");
    playerList.innerHTML = xhr.responseText;
    if(!playerList.querySelector("player")){
      return;
    }
    checkPlayerDataAge(playerList); // TODO
    updatePlayerEntities(playerList);
    removeOldEntities();
    updateEntityGroups();
    calculateHoverOffsets();
  }
  
  function transformElem(elemStyle, transformation){
    elemStyle.WebkitTransform = transformation;
    elemStyle.MozTransform = transformation;
    elemStyle.msTransform = transformation;
  }
  
  function closeHoveredGroup(){
    if(lastHoveredGroup){
      tryHoverGroup = lastHoveredGroup;
      lastHoveredGroup.mouseLeaveFunc();
    }
  }
  
  function clearGroupCenterElems(){
    let centers = mapElem.querySelectorAll(".syl_map_group_center");
    Array.prototype.forEach.call(centers, (center) => {
      mapElem.removeChild(center);
    });
  }
  
  function setGroupCenterEvents(group){
    const groupCenterElem = group.centerElem;
    const groupCenterElemStyle = groupCenterElem.style;
    group.mouseEnterFunc = () => {
      for(let entity of group.entities){
        let elemStyle = entity.elem.style;
        transformElem(
          elemStyle,
          "translate(" + 
            entity.xHoverOffset + "%, " + 
            entity.yHoverOffset + 
          "%)"
        );
        elemStyle.zIndex = "1000";
        entity.groupOpen = true;
      }
      groupCenterElemStyle.zIndex = "999";
      transformElem(groupCenterElemStyle, "scale(1,1)");
      
      mapGroupEscapeFunc = group.mouseLeaveFunc; // would sleep() interfere?
      lastHoveredGroup = group;
    };
    
    group.mouseLeaveFunc = () => {
      for(let entity of group.entities){
        let elemStyle = entity.elem.style;
        transformElem(elemStyle, "translate(0px, 0px)");
        elemStyle.zIndex = "initial";
        entity.groupOpen = false;
      }
      groupCenterElemStyle.zIndex = "initial";
      transformElem(groupCenterElemStyle, "scale(0,0)");
      
      mapGroupEscapeFunc = null;
      playerPreviewElem.style.display = "none"; 
      
      lastHoveredGroup = null;
    };
    
    if(group.entities.length > 1){
      groupCenterElem.onmouseenter = group.mouseEnterFunc;
    }
    groupCenterElem.onmouseleave = group.mouseLeaveFunc;
  }
  
  function createGroupCenterElems(){
    let fragment = document.createDocumentFragment();
    for(let group of mapEntityGroups){
      const groupCenterElem = document.createElementNS(
        "http://www.w3.org/2000/svg", "svg"
      );
      groupCenterElem.setAttribute("class", "syl_map_group_center");
      //groupCenterElem.className = "syl_map_group_center";
      transformElem(groupCenterElem.style, "scale(0,0)");
      
      group.centerElem = groupCenterElem;
      
      const xCentroid = group.xCentroid;
      const yCentroid = group.yCentroid;
      const centerRadius = group.centerRadius;
      const centerDiameter = 2 * centerRadius;
      
      const centerLeft = xCentroid - centerRadius;
      const centerTop = yCentroid - centerRadius;
      
      const groupCenterElemStyle = groupCenterElem.style;
      groupCenterElemStyle.left = centerLeft + "%";
      groupCenterElemStyle.top = centerTop + "%";
      groupCenterElemStyle.width = centerDiameter + "%";
      groupCenterElemStyle.height = centerDiameter + "%";
      
      const centerToMapCoef = 50 / centerRadius;
      const entitySize = entityPlayerSizePercentage / 100;
      
      for(let entity of group.entities){
        const lineElem = document.createElementNS(
          "http://www.w3.org/2000/svg", "line"
        );
        const x = entity.x;
        const y = entity.y;
        lineElem.setAttribute("x1", 
          ((x - centerLeft) * centerToMapCoef) + "%"
        );
        lineElem.setAttribute("y1", 
          ((y - centerTop) * centerToMapCoef) + "%"
        );
        lineElem.setAttribute("x2", 
          ((entity.xHoverOffset * entitySize + centerRadius -
          (xCentroid - x)) * centerToMapCoef) + "%"
        );
        lineElem.setAttribute("y2", 
          ((entity.yHoverOffset * entitySize + centerRadius -
          (yCentroid - y)) * centerToMapCoef) + "%"
        );
        lineElem.setAttribute(
          "style", 
          "position: absolute; " + 
          "stroke: rgb(255,255,255); stroke-width: 0.5;"
        );
        
        groupCenterElem.appendChild(lineElem);
      }
      
      fragment.appendChild(groupCenterElem);
      
      setGroupCenterEvents(group);
    }
    
    mapElem.insertBefore(fragment, mapElem.firstChild);
  }
  
  function updateGroupElems(){
    closeHoveredGroup();
    clearGroupCenterElems();
    createGroupCenterElems();
  }
  
  function makeEntityElem(){
    let entityElem = document.createElement("div");
    entityElem.className = "syl_map_entity";
    return entityElem;
  }
  
  function getPlayerAvatarUrl(profileElem){
    const avatarElem = profileElem.getElementsByClassName("picture")[0];
    if(!avatarElem){
      return "";
    }
    const imgElem = avatarElem.getElementsByTagName("img")[0];
    if(!imgElem){
      return "";
    }
    return imgElem.getAttribute("src");
  }
  
  function tryPushDetail(detailNames, detailValues, profileElem, className){
    const detailElems = profileElem.getElementsByClassName(className);
    if(detailElems.length > 0){
      detailNames.push(detailElems[0].innerHTML);
      detailValues.push(detailElems[1].innerHTML);
    }
  }
  
  function parseDetails(detailNames, detailValues){
    const detailCount = detailNames.length;
    let newNames = [];
    let newValues = [];
    
    //const symbolNameStart = "&lt;"; // < // TODO
    //const symbolNameEnd = "&gt;"; // < // "::"
    
    let readUpTo = function(c, delimiter){
      let str = "";
      let total = 0;
      while(true){
        let i = c.indexOf(delimiter);
        total += i;
        if(i < 0){
          return {str: c, consumed: -1};
        }else if(i >= 1 && c.charAt(i - 1) == "\\"){
          let c2 = c.substring(i + 1);
          str = str.concat(c.substring(0, i - 1), delimiter);
          c = c.substring(i + 1);
          total++;
          continue;
        }
        str = str.concat(c.substring(0, i));
        return {str: str, consumed: total};
      }
    };
    
    for(let [i, detailValue] of detailValues.entries()){
      let c = detailValue;
      const {str, consumed} = readUpTo(c, "&lt;");
      if(consumed < 0){
        continue;
      }
      
      detailValues[i] = str.trim();
      c = c.substring(consumed + 4);// TODO
      while(c){
        const {str: newName, consumed: nameLen} = readUpTo(c, "&gt;");
            console.log(newName);
        if(nameLen < 0){ // Incomplete extension format
          break;
        }
        newNames.push(newName.trim());
        c = c.substring(nameLen + 4);// TODO
        const {str: newValue, consumed: valueLen} = readUpTo(c, "&lt;");
            console.log(newValue);
        newValues.push(newValue.trim());
        if(valueLen < 0){ // No further additions
          break;
        }
        c = c.substring(valueLen + 4);// TODO
      }
    }
    
    for(let [i, newName] of newNames.entries()){
      for(let j = 0; j < detailCount; j++){
        if(newName.toLowerCase() == detailNames[j].toLowerCase()){
          detailValues[j] = newValues[i];
          newNames.slice(i, 1);
          newValues.slice(i, 1);
          break;
        }
      }
    }
    // Don't delete user added extensions?
    detailNames = newNames.concat(detailNames);
    detailValues = newValues.concat(detailValues);
    
    for(let [i, detailValue] of detailValues.entries()){
      if(detailValue == ""){
        detailValues.splice(i, 1);
        detailNames.splice(i, 1);
        continue;
      }
      detailValues[i] = detailValues[i].replaceAll("\\&lt;", "&lt;");
      detailValues[i] = detailValues[i].replaceAll("\\&gt;", "&gt;");
    }
    
    return {detailNames: detailNames, detailValues: detailValues};
  }
  
  function getPlayerDetails(profileElem){
    let detailNames = [];
    let detailValues = [];
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-profile_deername");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-profile_displayname");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-profile_realname");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-profile_homepage");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-user_from");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-profile_country");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-profile_gender");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-profile_birthday");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-user_occ");
    tryPushDetail(detailNames, detailValues, profileElem, 
      "profile-user_interests");
    
    //return parseDetails(detailNames, detailValues); // TODO
    return {
      detailNames: detailNames,
      detailValues: detailValues
    }
  }
  
  function getPlayerAccountAge(profileElem){
    const memberElems = profileElem.getElementsByClassName("user-member");
    if(memberElems.length > 0){
      const ddElems = memberElems[0].getElementsByTagName("dd");
      if(ddElems.length > 0){
        return ddElems[0].innerHTML;
      }
    }
    return "";
  }
  
  function appendParticipantType(textElem, entity){
    const entityData = entity.data;
    if(entityData.participantType == ParticipantType.NONE){
      return 0;
    }
    let roleElem = document.createElement("div");
    roleElem.style.fontSize = "140%";
    roleElem.style.fontWeight = "bold";
    switch(entityData.participantType){
      case ParticipantType.JUDGE:
        roleElem.innerHTML += "Judge";
        roleElem.style.color = "#ffcf00";
        break;
      case ParticipantType.COMPETITOR:
        roleElem.innerHTML += "Competitor";
        roleElem.style.color = "#ff1f04";
        break;
      case ParticipantType.CHALLENGER:
        roleElem.innerHTML += "Challenger";
        roleElem.style.color = "#b40039";
        break;
      case ParticipantType.WILDCARD:
        roleElem.innerHTML += "Wildcard";
        roleElem.style.color = "green";
        break;
    }
    textElem.appendChild(roleElem);
  }
  
  function populatePlayerEntityDetails(entity, profileElem){
    let minDetailHeight = 0;
    const textElem = document.createElement("div");
    
    const details = getPlayerDetails(profileElem);
    const accountAge = getPlayerAccountAge(profileElem);
    const avatarUrl = getPlayerAvatarUrl(profileElem);
    if(avatarUrl){
      let avatarElem = document.createElement("img");
      avatarElem.className = "avatar";
      avatarElem.src = avatarUrl;
      textElem.appendChild(avatarElem);
      minDetailHeight = 13;
    }
    
    appendParticipantType(textElem, entity);
    
    let appendDetail = function(textElem, name, value){
      let nameElem = document.createElement("dt");
      nameElem.innerHTML = name;
      textElem.appendChild(nameElem);
      let valueElem = document.createElement("dd");
      valueElem.innerHTML = value;
      textElem.appendChild(valueElem);
    };
    
    const detailCount = details.detailNames.length;
    for(let i = 0; i < detailCount; i++){
      appendDetail(textElem, details.detailNames[i], details.detailValues[i]);
    }
    
    appendDetail(textElem, "Member for", accountAge);
    entity.data.userDetailText = textElem.innerHTML;
    //entity.data.userDetailHeight = 
    return;
  }

  function getPlayerName(url, successCallback) {
    // const url = "/machine/playerpage.php?symbol=" + picto;
    const method = "HEAD";
  
    let resquestHeaders = [];
  
    const noCache = true;
    let xhr = null;
    if(window.XMLHttpRequest){
      xhr = new XMLHttpRequest();
    }else{
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
  
    xhr.onreadystatechange = () => {
      // console.log(method + " onreadystatechange " + xhr.getResponseHeader('Location'));
      const fullUrl = xhr.getResponseHeader('Location');
      if(fullUrl != null) {
        console.log(fullUrl);
        const name = fullUrl.substring(39, fullUrl.length);
        successCallback(name);
      }
    }
    
    xhr.ontimeout = () => {
      console.log("Connection to " + url + "Timed out.");
    };
    xhr.open(method, url, true);
    // xhr.setRequestHeader("Content-Security-Policy", "upgrade-insecure-requests");
    // xhr.setRequestHeader("Upgrade-Insecure-Requests", "1");
    console.log(resquestHeaders);
    resquestHeaders.forEach(pair => {
      console.log(pair[0] + ":" + pair[1]);
      xhr.setRequestHeader(pair[0], pair[1]);
    });
    if(noCache){
      xhr.setRequestHeader(
        "Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"
      );
      xhr.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
      xhr.setRequestHeader("Pragma", "no-cache");
    }
    //xhr.timeout = 2 * 1000;
    xhr.send();
  }
  
  function findPlayerPageUrl(entity){
    const entityData = entity.data;
    const playerNotFoundText = "Could not find this player's page!";
    
    //entityData.userPageUrl = playerPageUrl + entityData.pictoWord = playerpage.php?synbol=1234#
    getPlayerName(
      entityData.userPageUrl,
      (name) => {
        console.log(name);
      }
    );
    return;
    requestHttp(
      entityData.userPageUrl, 
      (xhr) => {
        // This would all just work if only Location in machine's header hadn't been intentionally removed...
        //const userNameUrl = xhr.responseURL;
        const pageElem = elemFromText(xhr.responseText);
        //const centerElems = pageElem.querySelectorAll("#center");
        //if(centerElems.length > 0){
          //const pageTitles = 
          //  centerElems[0].getElementsByTagName("h2");
        const centerElem = pageElem.querySelector("#center");
        if(centerElem){
          const pageTitles = 
            centerElem.getElementsByTagName("h2");
          if(pageTitles.length > 0){
            let userNameUrl = playerPageTarget + pageTitles[0].innerHTML.replace(/\W/g, "");
            //userNameUrl = userNameUrl.replace(/\W/g, "");
            console.log(userNameUrl);
            const profileElems = 
              pageElem.getElementsByClassName("custom_profiles");
            if(profileElems.length > 0){
              entityData.userPageLinkElem.href = userNameUrl;
              entityData.userPageUrl = userNameUrl;
              try{
                populatePlayerEntityDetails(entity, profileElems[0]);
              }catch(e){
                displayErrorExeption(e);
              }
            }else{
              let findPageRecursive = function(nameUrl, tries){
                if(tries > maxUserPageTries){
                  entityData.userDetailText = "There are more than " +
                    maxUserPageTries + 
                    " pages with this player's name!<br />";
                  return;
                }
                const url = nameUrl + "-" + (tries);
                requestHttp(
                  url, 
                  (xhr) => {
                    const pageElem = elemFromText(xhr.responseText);
                    const profileElems = 
                      pageElem.getElementsByClassName("custom_profiles");
                    if(profileElems.length > 0){
                      entityData.userPageLinkElem.href = url;
                      entityData.userPageUrl = url;
                      try{
                        populatePlayerEntityDetails(entity, profileElems[0]);
                      }catch(e){
                        displayErrorExeption(e);
                      }
                     // TODO force update detail box and href
                    }else{
                      findPageRecursive(nameUrl, tries + 1);
                    }
                  },
                  (xhr) => {
                    entityData.userDetailText = playerNotFoundText +
                      "<br />The server may be down.";
                    entityData.userPageLinkElem.href = userNameUrl;
                    entityData.userPageUrl = userNameUrl;
                  }
                );
              };
              findPageRecursive(userNameUrl, 0);
            }
            return;
          }
        }
        const userNameUrl = xhr.responseURL;
        if(userNameUrl){
          entityData.userDetailText = playerNotFoundText + 
            "<br />They may not have created a biography yet or you may be logged out.";
          entityData.userPageLinkElem.href = userNameUrl;
          entityData.userPageUrl = userNameUrl;
        }else{
          entityData.userDetailText = playerNotFoundText + 
            "<br />Your browser might not support xhr.responseURL.";
        }
      },
      (xhr) => {
        const userNameUrl = xhr.responseURL;
        if(userNameUrl){
          entityData.userDetailText = playerNotFoundText + 
            "<br />They may not have created a biography yet or you may be logged out.";
          entityData.userPageLinkElem.href = userNameUrl;
          entityData.userPageUrl = userNameUrl;
        }else{
          entityData.userDetailText = playerNotFoundText + 
            "<br />Your browser might not support xhr.responseURL.";
        }
      }
    );
  }
  
  function addPlayerElems(entity){
    let entityData = entity.data;
    let entityElem = entity.elem;
    entityData.statusElem = document.createElement("div");
    entityData.statusElem.className = "syl_map_entity_player_status";
    entityElem.appendChild(entityData.statusElem);
    
    let generationNumber = entityData.generationNumber;
    
    for(let i = 0; i < 4; i++){
      let glyphElem = document.createElement("div");
      glyphElem.className = "syl_glyph gen" + generationNumber;
      entityData.glyphElems.push(glyphElem);
      entityElem.appendChild(glyphElem);
    }
    
    let linkElem = document.createElement("a");
    linkElem.className = "syl_map_entity_link";
    linkElem.href = playerPageUrl + entityData.pictoWord;
    linkElem.target = "_blank";
    entityData.userPageLinkElem = linkElem;
    entityData.userPageUrl = playerPageUrl + entityData.pictoWord; // syl_player_page_source
    entityElem.appendChild(linkElem);
    findPlayerPageUrl(entity);
  }
  
  function addGenericElem(entity){
    entity.elem.innerHTML = entity.data.elemHtml;
  }
  
  function showPlayerPreviewPromise(entity){
    return new Promise(function(resolve, reject){
      let previewStyle = playerPreviewElem.style;
      const x = entity.x + entity.xHoverOffset * (entity.width / 100);
      const y = entity.y + entity.yHoverOffset * (entity.height / 100);
      let left = x + 5;
      if(left + previewWidth > 100){
        left = x - 5 - previewWidth;
      }
      const top = y;
      const offset = -y;
      previewStyle.left = left + "%";
      previewStyle.top = top + "%";
      previewStyle.zIndex = "1010";
      playerPreviewTextElem.innerHTML = entity.data.userDetailText;
      transformElem(previewStyle, "translateY(" + offset + "%)");
      previewStyle.display = "block";
      resolve();
    });
  }
  
  async function showPlayerPreview(entity){
    await sleep(100);
    if(!lastHoveredEntity){
      return;
    }
    let previewStyle = playerPreviewElem.style;
    const x = entity.x + entity.xHoverOffset * (entity.width / 100);
    const y = entity.y + entity.yHoverOffset * (entity.height / 100);
    let left = x + 5;
    if(left + previewWidth > 100){
      left = x - 5 - previewWidth;
    }
    const top = y;
    const offset = -y;
    previewStyle.left = left + "%";
    previewStyle.top = top + "%";
    previewStyle.zIndex = "1010";
    playerPreviewTextElem.innerHTML = entity.data.userDetailText;
    transformElem(previewStyle, "translateY(" + offset + "%)");
    previewStyle.display = "block";
    //previewShowHideQueue = previewShowHideQueue.then(() => {
    //  return showPlayerPreviewPromise(entity);
    //});
  }
  
  function hidePlayerPreview(){
    playerPreviewElem.style.display = "none";
    //previewShowHideQueue = previewShowHideQueue.then(() => {
    //  return new Promise(function(resolve, reject){
    //    playerPreviewElem.style.display = "none";
    //    resolve();
    //  });
    //});
  }
  
  function setEntityEvents(entity){
    let entityGroup = entity.group;// TODO entityGroup doesn't work
    let entityElem = entity.elem;
    entityElem.onmouseenter = () => {
      if(tryHoverEntity){
        tryHoverEntity.group.mouseLeaveFunc();
        tryHoverEntity = null;
      }
      entity.group.mouseEnterFunc(); // TODO entityGroup doesn't work here for some reason
      
      transformElem(
        entityElem.style,
        "translate(" + 
          entity.xHoverOffset + "%, " + 
          entity.yHoverOffset + 
        "%) scale(2,2)"
      );
      if(entity.type == EntityType.PLAYER && doDisplayPlayerPreview){
        showPlayerPreview(entity);
      }
      lastHoveredEntity = entity;
    };
    entityElem.onmouseleave = () => {
      entity.group.mouseLeaveFunc(); // TODO entityGroup doesn't work here for some reason
      transformElem(entityElem.style, "scale(1,1)");
      lastHoveredEntity = null;
      hidePlayerPreview();
    };
    return 0;
  }
  
  function addEntityElems(entity){
    entity.elem = makeEntityElem();
    switch(entity.type){
      case EntityType.PLAYER:
        addPlayerElems(entity);
        break;
      case EntityType.GENERIC:
        addGenericElem(entity);
        break;
      default:
        ;
    }
    if(entity.isInteractive){
      setEntityEvents(entity);
    }
    mapElem.appendChild(entity.elem);
    entity.isNew = false;
  }
  
  function updatePlayerElem(entity){
    const entityData = entity.data;
    const isSleeping = entityData.state == 0;
    /*const rowOffset = isSleeping ? 4 : 0;
    for(let i = 0; i < 4; i++){
      const col = entityData.glyphCols[i];
      const row = glyphRowHeight * (i + rowOffset);
      entityData.glyphElems[i].style.backgroundPosition = 
        col + "% " + row + "%";
    }
    */
    for(let i = 0; i < 4; i++){
      const col = isSleeping ? 0 : glyphColWidth;
      const row = entityData.glyphRows[i] * glyphRowHeight;
      entityData.glyphElems[i].style.backgroundPosition = 
        col + "% " + row + "%";
    }
    
    const entityStatusElem = entityData.statusElem;
    switch(entityData.state){
      case 0: // Sleeping
        entityStatusElem.innerHTML = playerSleepingStatusText;
        entityStatusElem.style.color = playerSleepingStatusColor;
        entityStatusElem.style.fontSize = playerSleepingStatusTextSize;
        break;
      case 13: // Dancing
        entityStatusElem.innerHTML = playerDancingStatusText;
        entityStatusElem.style.color = playerDancingStatusColor;
        entityStatusElem.style.fontSize = playerDancingStatusTextSize;
        break;
      default:
        entityStatusElem.innerHTML = "";
        break;
    }
    
    switch(entityData.participantType){
      case ParticipantType.JUDGE:
        //entityStatusElem.innerHTML += "&sup;";
        entityStatusElem.innerHTML += "&thorn;";
        entityStatusElem.style.color = "#ffcf00"; // fontSize?
        entityStatusElem.style.fontSize = "75%";
        break;
      case ParticipantType.COMPETITOR:
        entityStatusElem.innerHTML += "&#9808;&#xFE0E;";
        entityStatusElem.style.color = "#ff1f04";
        entityStatusElem.style.fontSize = "75%";
        break;
      case ParticipantType.CHALLENGER:
        entityStatusElem.innerHTML += "&#9809;&#xFE0E;";
        entityStatusElem.style.color = "#b40039";
        entityStatusElem.style.fontSize = "75%";
        break;
      case ParticipantType.WILDCARD:
        entityStatusElem.innerHTML += "&#9802;&#xFE0E;";
        entityStatusElem.style.color = "green";
        entityStatusElem.style.fontSize = "75%";
        break;
    }
  }
  
  function updateEntityElemPosition(entity){
    const entityElemStyle = entity.elem.style;
    entityElemStyle.left = (entity.x - entity.width * 0.5) + "%";
    entityElemStyle.top = (entity.y - entity.height * 0.5) + "%";
    entityElemStyle.width = entity.width + "%";
    entityElemStyle.height = entity.height + "%";
  }
  
  function updateEntityElems(){
    for(let entity of mapEntites){
      if(entity.isNew){
        addEntityElems(entity);
      }
      if(entity.type == EntityType.PLAYER){
        updatePlayerElem(entity);
      }
      updateEntityElemPosition(entity);
    }
  }
  
  function trackHoveredEntiy(){
    if(lastHoveredEntity){
      tryHoverEntity = lastHoveredEntity;
      tryHoverEntity.elem.onmouseenter();
    }else if(tryHoverGroup){ // This should really work by majority
      let closestGroup = tryHoverGroup;
      let closestDistSqr = 2 * 100 * 100;
      for(let group of mapEntityGroups){
        if(group.entities.length > 1){
          const radiusDifference = 
            Math.abs(
              tryHoverGroup.centerRadius - group.centerRadius
            ) * 1.1;
          const dx = Math.abs(tryHoverGroup.xCentroid - group.xCentroid);
          const dy = Math.abs(tryHoverGroup.yCentroid - group.yCentroid);
          if(dx <= radiusDifference && dy <= radiusDifference){
            const distSqr = dx * dx + dy * dy;
            if(distSqr < closestDistSqr){
              closestDistSqr = distSqr;
              closestGroup = group;
            }
          }
        }
      }
      closestGroup.mouseEnterFunc();
    }
    tryHoverGroup = null;
  }
  
  function displayPlayerCount(){
    if(playerCountElem){
      const dateNow = new Date();
      let payerCount = 0;
      for(let entity of mapEntites){
        if(entity.type == EntityType.PLAYER){
          payerCount++;
        }
      }
      const pad = function(num){
        if(num < 10){
          return "0" + num;
        }
        return num;
      }
      
      playerCountElem.innerHTML = 
        "There are " + payerCount + " named deer in the Forest on " +
        dateNow.toDateString() + " at " + 
        pad(dateNow.getHours()) + ":" + pad(dateNow.getMinutes());
    }
  }
  
  function updateScreenElems(){
    updateGroupElems();
    updateEntityElems();
    trackHoveredEntiy();
    displayPlayerCount();
  }

  function updateMap(xhr){
    updateMapEntities(xhr);
    updateScreenElems();
  }

  function getPlayers(successCallback, errorCallback){
    const url = "/machine/playerstatus.php?action=get";
    let xhr = null;
    if(window.XMLHttpRequest){
      xhr = new XMLHttpRequest();
    }else{
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xhr.onreadystatechange = () => {
      try{
        if(xhr.readyState == 4){
          var status = xhr.status;
          if(status >= 200 && status < 400 && xhr.HEADERS_RECEIVED){
            successCallback(xhr);
          }else{
            logError("Problem connecting to " + url + ". Status: " + status);
            errorCallback(xhr);
          }
        }
      }catch(e){
        displayErrorExeption(e);
      }
    };
    xhr.ontimeout = () => {
      logError("Connection to " + url + " Timed out.");
      errorCallback(xhr);
    };
    xhr.open("GET", url, true);
    xhr.setRequestHeader(
      "Cache-Control", "no-cache, no-store, max-age=0, must-revalidate"
    );
    xhr.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
    xhr.setRequestHeader("Pragma", "no-cache");
    //xhr.timeout = 2 * 1000;
    xhr.send();
  }

  function updateMapTimeout(){
    getPlayers(
      (xhr) => {
        clearServerError();
        updateMap(xhr);
        updateTimeout = setTimeout(
          updateMapTimeout, updateDelaySeconds * 1000
        );
      },
      (xhr) => {
        writeServerError("Player data unavailable");
        updateTimeout = setTimeout(
          updateMapTimeout, updateDelaySeconds * 1000
        );
      }
    );
  }
  
  this.init = () => {
    try{
      initMap();
    }catch(e){
      displayErrorExeption(e);
    }
  }
  
  this.startUpdating = () => {
    try{
      updateMapTimeout();
    }catch(e){
      displayErrorExeption(e);
    }
  }
  
  this.stopUpdating = () => {
    try{
      clearTimeout(updateTimeout);
    }catch(e){
      displayErrorExeption(e);
    }
  }
}

// TODO: put this in a function s.t. it goes out of scope after the script
// No, don't want to remove ability to stop updating in case of emergencies
let sylMap = new SylTefMap();

sylMap.init();
sylMap.startUpdating();
