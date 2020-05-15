//Copyright [2020] [Indian Institute of Science, Bangalore]
//SPDX-License-Identifier: Apache-2.0
//
// Centre for Networked Intelligence, EECS-RBCCPS, Indian Institute of Science Bangalore
// Calculator to gauge the readiness of workplace to re-open with precautions for
// avoiding spread of COVID-19
//
// Prevent forms from submitting.
function preventFormSubmit() {
  var forms = document.querySelectorAll('form');
  for (var i = 0; i < forms.length; i++) {
    forms[i].addEventListener('submit', function(event) {
    event.preventDefault();
    });
  }
}
window.addEventListener('load', preventFormSubmit);    

function onSuccess (scoreMsg) {
    document.getElementById("output").innerHTML=scoreMsg;
    document.getElementById("output").style.display = "inline";
}

function get_field_value(field_value, default_value){
  var return_value = parseInt(field_value) || default_value;
  return return_value;
}

function getValues(){
  var dict = new Object();
  
  // Nature of Establishment
  dict["uuidQ"] = parseInt(document.querySelector('input[name="uuidQ"]:checked').value); // UUID Question
  dict["NOE"] = parseInt(document.getElementById("NOE").value); // Nature of Establishment
  
  // Employee Information
  dict["nShifts"] = parseInt(document.getElementById("nShifts").value); // Number of shifts
  for (var i=0; i<dict["nShifts"]; ++i){
    dict["nM_"+(i+1).toString()] = parseInt(document.getElementById("nM_"+(i+1).toString()).value); // Number of male employees in shift i
    dict["nF_"+(i+1).toString()] = parseInt(document.getElementById("nF_"+(i+1).toString()).value); // Number of female employees in shift i
    dict["nOth_"+(i+1).toString()] = parseInt(document.getElementById("nOth_"+(i+1).toString()).value); // Number of other employees in shift i
    dict["pCS_"+(i+1).toString()] = parseInt(document.getElementById("pCS_"+(i+1).toString()).value); // Number of casual labour and security in shift i
  }

  dict["tGapShift"] = parseFloat(document.getElementById("tGapShift").value); // Time gap between shifts in hours
  dict["informCZEmp"] = parseInt(document.querySelector('input[name="informCZEmp"]:checked').value); // Inform containment zone employee not to come
  dict["informWFH"] = parseInt(document.querySelector('input[name="informWFH"]:checked').value); // Encourage work from home 
  dict["n29"] = parseInt(document.getElementById("n29").value); // Number of employees with age betwwen 15 and 29
  dict["n49"] = parseInt(document.getElementById("n49").value); // Number of employees with age betwwen 30 and 49
  dict["n64"] = parseInt(document.getElementById("n64").value); // Number of employees with age betwwen 50 and 64
  dict["n65plus"] = parseInt(document.getElementById("n65plus").value); // Number of employees with age more than 65

  // Office Infrastructure Information
  dict["nBldng"] = parseInt(document.getElementById("nBldng").value); // Number of buildings // Not used in calculations
  dict["tArea"] = parseInt(document.getElementById("tArea").value); // Total office area in sq.ft
  dict["nFloors"] = parseInt(document.getElementById("nFloors").value); // Number of floors in office
  dict["opnCubArea"] = parseInt(document.getElementById("opnCubArea").value); // Total open cubicle area in sq.ft
  dict["strsArea"] = parseInt(document.getElementById("strsArea").value); // Total stores area in sq.ft // Not used in the calculations
  dict["mntrCCTV"] = parseInt(document.querySelector('input[name="mntrCCTV"]:checked').value); // CCTV monitoring
  dict["acsCntrl"] = parseInt(document.querySelector('input[name="acsCntrl"]:checked').value); // Access controlled // Not used in calculations
  dict["ntrlSlAr"] = parseInt(document.querySelector('input[name="ntrlSlAr"]:checked').value); // Access to natural sun light and fresh air
  dict["baDoor"] = parseInt(document.getElementById("baDoor").value); // Number of biometric based access doors
  dict["rfidDoor"] = parseInt(document.getElementById("rfidDoor").value); // Number of RFID based access doors
  dict["sntBio"] = parseInt(document.querySelector('input[name="sntBio"]:checked').value); // Sanitiser at Biometric access doors
  dict["nCW"] = parseInt(document.getElementById("nCW").value); // Number of companies in Cowork space

  // Office Composition
  dict["nSOfcRm"] = parseInt(document.getElementById("nSOfcRm").value); // Number of single office rooms
  dict["n2pOfcRm"] = parseInt(document.getElementById("n2pOfcRm").value); // Number of office rooms with 2 people
  dict["n2pPlusOfcRm"] = parseInt(document.getElementById("n2pPlusOfcRm").value); // Number of office rooms with more than 2 people
  dict["nCub"] = parseInt(document.getElementById("nCub").value); // Number of office seats with cubicle separation
  dict["nRem"] = parseInt(document.getElementById("nRem").value); // Number of remaining office seats
  dict["percAC"] = parseInt(document.getElementById("percAC").value); // Percentage of air conditioned premise
  dict["centralAC"] = parseInt(document.querySelector('input[name="centralAC"]:checked').value); // centralised A/C
  dict["tempAC"] = parseInt(document.getElementById("tempAC").value); // Temperature setting

  // Common Usage Area
  dict["nEle"] = parseInt(document.getElementById("nEle").value); // Number of Elevetors
  dict["eleCpct"] = parseInt(document.getElementById("eleCpct").value); // Average capacity of Elevetors
  dict["nEleDinf"] = parseInt(document.getElementById("nEleDinf").value); // Frequency of elevetor disinfection process
  dict["nStrCln"] = parseInt(document.getElementById("nStrCln").value); // Frequency of stairway cleaning
  dict["nStrHrDinf"] = parseInt(document.getElementById("nStrHrDinf").value); // Frequency of stairway handrails disinfection process
  dict["mtngSpts"] = parseInt(document.getElementById("mtngSpts").value); // meeting rooms
  dict["oMtngSpts"] = parseInt(document.getElementById("oMtngSpts").value); // Other meeting spaces
  if (dict["NOE"]==3){
    dict["sfRsrtPlnt"] = parseInt(document.querySelector('input[name="sfRsrtPlnt"]:checked').value); // Safe restart plant flag for manufacturing
    dict["onstDsMngt"] = parseInt(document.querySelector('input[name="onstDsMngt"]:checked').value); // On-site disaster management flag for manufacturing
  }

  // Epidemic related precautions
  dict["tempScreening"] = parseInt(document.querySelector('input[name="tempScreening"]:checked').value); // Temperature screening of employee
  dict["faceCover"] = parseInt(document.querySelector('input[name="faceCover"]:checked').value); // Face is covered with mask
  dict["adqFaceCover"] = parseInt(document.querySelector('input[name="adqFaceCover"]:checked').value); // Adequate Facecover quantity
  dict["newShfts"] = parseInt(document.querySelector('input[name="newShfts"]:checked').value); // New shifts/staggered work timings
  dict["dclrtn"] = parseInt(document.querySelector('input[name="dclrtn"]:checked').value); // No symptoms declaration  
  dict["advAvdLPM"] = parseInt(document.querySelector('input[name="advAvdLPM"]:checked').value); // Avoid large physical meetings
  dict["vrtlMtng"] = parseInt(document.querySelector('input[name="vrtlMtng"]:checked').value); // Virtual meeting arrangements
  dict["brrrs"] = parseInt(document.querySelector('input[name="brrrs"]:checked').value); // Barriers in place
  dict["encrgStrws"] = parseInt(document.querySelector('input[name="encrgStrws"]:checked').value); // Encourage to use stairways
  dict["nHsS"] = parseInt(document.getElementById("nHsS").value); // Number of hand-sanitiser stations
  dict["tchFree"] = parseInt(document.querySelector('input[name="tchFree"]:checked').value); // Hand sanitisers touch free
  dict["smkZS"] = parseInt(document.querySelector('input[name="smkZS"]:checked').value); // Smoking zone sealed
  //dict["nPGT"] = parseInt(document.getElementById("nPGT").value); // Number of employees consuming Pan masala, gutkha, tobacco 
  dict["nWsB"] = parseInt(document.getElementById("nWsB").value); // Number of warning sign boards
  dict["nASapp"] = parseInt(document.getElementById("nASapp").value); // Number of employees with Aarogya Setu app
  if (dict["NOE"]==3){
    dict["strlzBxs"] = parseInt(document.querySelector('input[name="strlzBxs"]:checked').value); // sterilise manufacturing box
    dict["mskPPE"] = parseInt(document.querySelector('input[name="mskPPE"]:checked').value); // PPE mask for manufacturing workers
  }

  // Isolation room
  dict["hl"] = parseInt(document.querySelector('input[name="hl"]:checked').value); // Company helpline
  dict["iQS"] = parseInt(document.querySelector('input[name="iQS"]:checked').value); // Immediate quarantine space
  dict["amblnc"] = parseInt(document.querySelector('input[name="amblnc"]:checked').value); // Ambulance facility
  dict["lHsptl"] = parseInt(document.querySelector('input[name="lHsptl"]:checked').value); // List of nearby hospitals etc.
  dict["emrgncResp"] = parseInt(document.querySelector('input[name="emrgncResp"]:checked').value); // Emergency Response
  dict["alrg"] = parseInt(document.querySelector('input[name="alrg"]:checked').value); // Employee allergy list
  dict["imdtFM"] = parseInt(document.querySelector('input[name="imdtFM"]:checked').value); // Immediate family members list
  dict["lstUpdtTime"] = parseInt(document.getElementById("lstUpdtTime").value); // Last information update time
  dict["medInsurance"] = parseInt(document.querySelector('input[name="medInsurance"]:checked').value); // Do all employees have medical insurance

  // Advertisement and Outreach
  dict["covidPage"] = parseInt(document.querySelector('input[name="covidPage"]:checked').value); // Covid Awareness Page
  dict["faq"] = parseInt(document.querySelector('input[name="faq"]:checked').value); // FAQ Page
  dict["sPers"] = parseInt(document.querySelector('input[name="sPers"]:checked').value); // Cleaniness and safety person
  dict["advSclDis"] = parseInt(document.querySelector('input[name="advSclDis"]:checked').value); // Advised social distancing
  dict["advWFHVul"] = parseInt(document.querySelector('input[name="advWFHVul"]:checked').value); // Advised work from home to elderly and women
  dict["snzCvr"] = parseInt(document.querySelector('input[name="snzCvr"]:checked').value); // Advised to cover sneeze
  dict["advNoHS"] = parseInt(document.querySelector('input[name="advNoHS"]:checked').value); // Advised not to shake hands
  dict["hkTrn"] = parseInt(document.querySelector('input[name="hkTrn"]:checked').value); // House-keeping staff training
  dict["hkEqp"] = parseInt(document.querySelector('input[name="hkEqp"]:checked').value); // House-keeping staff equipped
  dict["sPrgm"] = parseInt(document.querySelector('input[name="sPrgm"]:checked').value); // Special program on COVID-19
  dict["pstrs"] = parseInt(document.querySelector('input[name="pstrs"]:checked').value); // Prosters on hygiene and social distancing

  // Employee Interactions
  dict["nVstrs"] = parseInt(document.getElementById("nVstrs").value); // Number of visitors
  dict["nEmpCstmr"] = parseInt(document.getElementById("nEmpCstmr").value); // Number of employees that meet with customer
  dict["nDlvrHndlng"] = parseInt(document.getElementById("nDlvrHndlng").value); // Number of employees handling deliveries 
  dict["msk"] = parseInt(document.querySelector('input[name="msk"]:checked').value); // Employees wear mask
  dict["glvs"] = parseInt(document.querySelector('input[name="glvs"]:checked').value); // Employess wear mask and gloves
  dict["dsgntdCstmrPlc"] = parseInt(document.querySelector('input[name="dsgntdCstmrPlc"]:checked').value); // Designated customer meeting place
  
  // Mobility Related
  dict["nExtM"] = parseInt(document.getElementById("nExtM").value); // Number of employees that go outside to meet customers
  dict["nHM"] = parseInt(document.getElementById("nHM").value); // Number of employees that are more than 2 hours aways
  dict["nMM"] = parseInt(document.getElementById("nMM").value); // Number of employees that are more than 1 hour aways 
  dict["nMPD"] = parseFloat(document.getElementById("nMPD").value); // Meetings involving physical presence per day
  dict["avgMS"] = parseFloat(document.getElementById("avgMS").value); // Average number of members in the meeting
  
  // Canteen/Pantry
  dict["extFSP"] = parseInt(document.querySelector('input[name="extFSP"]:checked').value); // External food vendor
  dict["cntn"] = parseInt(document.querySelector('input[name="cntn"]:checked').value); // Canteen/pantry
  dict["seatingFood"] = parseInt(document.querySelector('input[name="seatingFood"]:checked').value); // Seating area for food
  dict["cntnACOp"] = parseInt(document.querySelector('input[name="cntnACOp"]:checked').value); // Canteen/pantry air condition operational
  dict["nBrkfst"] = parseInt(document.getElementById("nBrkfst").value); // Number of employees having breakfast in canteen
  dict["nLnch"] = parseInt(document.getElementById("nLnch").value); // Number of employees having lunch in canteen
  dict["nSnck"] = parseInt(document.getElementById("nSnck").value); // Number of employees having snacks/coffee in canteen
  dict["dBrkfst"] = parseInt(document.getElementById("dBrkfst").value); // Duration for which breakfast is served
  dict["dLnch"] = parseInt(document.getElementById("dLnch").value); // Duration for which lunch is served
  dict["dSnck"] = parseInt(document.getElementById("dSnck").value); // Duration for which coffee/snacks is served
  dict["nEmpHL"] = parseInt(document.getElementById("nEmpHL").value); // Number of employees who bring lunch from home
  dict["mlStggrd"] = parseInt(document.querySelector('input[name="mlStggrd"]:checked').value); // Meals staggered
  dict["utnslShrd"] = parseInt(document.querySelector('input[name="utnslShrd"]:checked').value); // Utensils shared
  dict["cntnArea"] = parseInt(document.getElementById("cntnArea").value); // Canteen area in sq.ft
  dict["mxCntnPpl"] = parseInt(document.getElementById("mxCntnPpl").value); // Maximum number of employees allowed in canteen at a time
  dict["nWS"] = parseInt(document.getElementById("nWS").value); // Number of water stations
  
  // Washroom Information
  dict["nGntsT"] = parseInt(document.getElementById("nGntsT").value); // Number of gents toilet
  dict["nLdsT"] = parseInt(document.getElementById("nLdsT").value); // Number of ladies toilet
  dict["tClnFreq"] = parseInt(document.getElementById("tClnFreq").value); // Frequency of toilet cleaning
  dict["spPrsnt"] = parseInt(document.querySelector('input[name="spPrsnt"]:checked').value); // Soap dispensed in toilet
  dict["noHT"] = parseInt(document.querySelector('input[name="noHT"]:checked').value); // No hand towel policy
  dict["freqCln"] = parseInt(document.getElementById("freqCln").value); // Frequency of cleaning
  dict["nHskpngStff"] = parseInt(document.getElementById("nHskpngStff").value); // Number of housekeeping staff
  dict["typeSanitation"] = parseInt(document.querySelector('input[name="typeSanitation"]:checked').value); //  Type of sanitation
  dict["nDinf"] = parseInt(document.getElementById("nDinf").value); // Number of disinfection activity per week
  dict["typeDisinfect"] = parseInt(document.querySelector('input[name="typeDisinfect"]:checked').value); //  Type of disinfection activity

  // Company Provided Transport
  dict["tempScreeningVhcl"] = parseInt(document.querySelector('input[name="tempScreeningVhcl"]:checked').value); // Temperature screening before journey
  dict["bsCpctAct"] = parseInt(document.getElementById("bsCpctAct").value); // Actual Bus capacity
  dict["bsCpctCur"] = parseInt(document.getElementById("bsCpctCur").value); // Current Bus capacity
  dict["mnBsCpctAct"] = parseInt(document.getElementById("mnBsCpctAct").value); // Actual Mini bus capacity 
  dict["mnBsCpctCur"] = parseInt(document.getElementById("mnBsCpctCur").value); // Current Mini bus capacity 
  dict["vnCpctAct"] = parseInt(document.getElementById("vnCpctAct").value); // Actual Van capacity 
  dict["vnCpctCur"] = parseInt(document.getElementById("vnCpctCur").value); // Current Van capacity 
  dict["svCpctAct"] = parseInt(document.getElementById("svCpctAct").value); // Actual SUV capacity 
  dict["svCpctCur"] = parseInt(document.getElementById("svCpctCur").value); // Current SUV capacity 
  dict["crCpctAct"] = parseInt(document.getElementById("crCpctAct").value); // Actual Car capacity
  dict["crCpctCur"] = parseInt(document.getElementById("crCpctCur").value); // Current Car capacity
  dict["mskMndt"] = parseInt(document.querySelector('input[name="mskMndt"]:checked').value); // Mask mandate
  dict["hsVhcl"] = parseInt(document.querySelector('input[name="hsVhcl"]:checked').value); // Hand sanitiser in vehicle
  dict["noACVhcl"] = parseInt(document.querySelector('input[name="noACVhcl"]:checked').value); // No AC use in vehicle
  dict["nTrnsptSnt"] = parseInt(document.getElementById("nTrnsptSnt").value); // Number of times transport bay is sanitised
  dict["drvSrnd"] = parseInt(document.querySelector('input[name="drvSrnd"]:checked').value); // Drivers screened
  dict["vhclSnt"] = parseInt(document.querySelector('input[name="vhclSnt"]:checked').value); // Vehicles sanitised
  dict["trvlr5K"] = parseInt(document.getElementById("trvlr5K").value); // Numbers travelling 0-5 km
  dict["trvlr10K"] = parseInt(document.getElementById("trvlr10K").value); // Numbers travelling 5-10 km
  dict["trvlr10Kplus"] = parseInt(document.getElementById("trvlr10Kplus").value); // Numbers travelling >10 km

  // Self-owned vehicle transport
  dict["noPlnR"] = parseInt(document.querySelector('input[name="noPlnR"]:checked').value); // No pillion riders
  dict["no2plusTrvl"] = parseInt(document.querySelector('input[name="no2plusTrvl"]:checked').value); // No 2 plus travel in car
  dict["hsLbb"] = parseInt(document.querySelector('input[name="hsLbb"]:checked').value); // Hand sanitiser in the lobby
  dict["mskCar"] = parseInt(document.querySelector('input[name="mskCar"]:checked').value); // Mask in car
  dict["trvlr5Kslf"] = parseInt(document.getElementById("trvlr5Kslf").value); // Numbers travelling 0-5 km private vehicle
  dict["trvlr10Kslf"] = parseInt(document.getElementById("trvlr10Kslf").value); // Numbers travelling 5-10 km private vehicle
  dict["trvlr10Kplusslf"] = parseInt(document.getElementById("trvlr10Kplusslf").value); // Numbers travelling >10 km private vehicle

  // Walking 
  dict["nWlk"] = parseInt(document.getElementById("nWlk").value); // Number of employees who walk to work
  dict["mskWlk"] = parseInt(document.querySelector('input[name="mskWlk"]:checked').value); // Mask while walking

  // Public Transport
  dict["mskPub"] = parseInt(document.querySelector('input[name="mskPub"]:checked').value); // Mask while in public transport
  dict["trvlr5Kpub"] = parseInt(document.getElementById("trvlr5Kpub").value); // Numbers travelling 0-5 km private vehicle
  dict["trvlr10Kpub"] = parseInt(document.getElementById("trvlr10Kpub").value); // Numbers travelling 5-10 km private vehicle
  dict["trvlr10Kpluspub"] = parseInt(document.getElementById("trvlr10Kpluspub").value); // Numbers travelling >10 km private vehicle

  // Time to reach office
  dict["n30Min"] = parseInt(document.getElementById("n30Min").value); // Number of employees taking 0-30 minutes
  dict["n60Min"] = parseInt(document.getElementById("n60Min").value); // Number of employees taking 30-60 minutes
  dict["n60plusMin"] = parseInt(document.getElementById("n60plusMin").value); // Number of employees taking >60 minutes

  // Company contact information
  dict["cmpName"] = document.getElementById("cmpName").value; // Company Name
  dict["emailAddr"] = document.getElementById("emailAddr").value; // Company Email

  return dict;
}

function clipAndRound_bounds (score) {
  var score_out = Math.round(score/10);
  if (score_out < 0 ) {
    score_out = 0;
  } else if (score_out > 100 ) {
    //console.log('Raw score: ' + score.toString());
    score_out = 100;
  }
  return score_out;
}

function clipto95 (score) {
  if (score>95) {
    score = 95;
  }
  return (score);
}

function scoreColor (score) {
  var color = "";
  if (score < 50) { color = "#d62828"; }
  else if (score >= 85) { color = "#2e933c"; }
  else { color = "#fcbf49"; }
  return color;
}

function sg_update(msg_count, current_sg, msg){
  msg_count += 1;
  current_sg = (current_sg=="") ? "" : current_sg + "<br>";
  current_sg += msg;
  return ([msg_count, current_sg])
}

function set_uuid(){
  var sub_uuid = document.getElementById("subUUID").innerText;
  var uuid_field = '';
  if ($("#uuid_status").val() == "Valid UUID") {
    uuid_field = document.getElementById("uuid").value;
  } else if (sub_uuid.length>0){
    uuid_field = sub_uuid.split(": ")[1]; // UUID value...
  }
  return (uuid_field);
}

function calcScore () {
  
  inputs = getValues(); //Read values from html page...

  mskWeight = 0.4;
  var number_of_suggestions = 3;
  var suggestion = "";

  //Mandate org name and email
  if (!inputs["emailAddr"] || !inputs["cmpName"]) {
    window.alert("Please provide organisation name and email to proceed")
    return -1;
  }
  
  var nM = inputs["nM_1"];
  var nF = inputs["nF_1"];
  var nOth = inputs["nOth_1"];
  var pCS = inputs["pCS_1"];
  var total_emp = inputs["n29"]+inputs["n49"]+inputs["n64"]+inputs["n65plus"];  
  var nEmp = inputs["nM_1"] + inputs["nF_1"] + inputs["nOth_1"];

  for (var i=2; i<inputs["nShifts"]; ++i){
    if (inputs["nM_"+(i).toString()]+inputs["nF_"+(i).toString()]+inputs["nOth_"+(i).toString()] > nEmp){
      nM = inputs["nM_"+(i).toString()];
      nF = inputs["nF_"+(i).toString()];
      nOth = inputs["nOth_"+(i).toString()];
      pCS = inputs["pCS_"+(i).toString()];
      nEmp = inputs["nM_"+(i).toString()]+inputs["nF_"+(i).toString()]+inputs["nOth_"+(i).toString()];
    }
  }

  // Office Infrastructure
  var nMeets = 4;
  var cFactor = 1;
  if(inputs["opnCubArea"]>0){
    cFactor = Math.max( ((inputs["nCub"] + inputs["nRem"])*40 / inputs["opnCubArea"]), 1 ); 
  }
  var crowding = 2*inputs["n2pOfcRm"] * nMeets + 3*inputs["n2pPlusOfcRm"] * nMeets * 1.2 +
      (inputs["nCub"] + inputs["nRem"] * 1.2) * nMeets * cFactor;
  //turn crowding into a per-employee crowding and then reduce it to account for shift occupancy
  crowding = ( crowding / total_emp )* (nEmp/total_emp);
  var stairsElev = 0.5 * inputs["nFloors"] * (1 + inputs["eleCpct"]/2 * (1-0.1*inputs["advSclDis"]))/2 * 4 * Math.max( (1 - 0.1*Math.min( inputs["nStrCln"], inputs["nEleDinf"] )), 0.5);
  var bmFlag = ((inputs["baDoor"] >= 1) ? 1 : 0);
  var accessContacts = 4 * ( 1 - 0.1*((bmFlag * inputs["sntBio"]) + inputs["mntrCCTV"] + ((inputs["rfidDoor"]>0) ? 1 : 0) ) ) * bmFlag;
  var shiftDelta = ( (inputs["tGapShift"] < 1) ? 1 : 0);
  var ac_factor = (inputs["percAC"]/100) * (inputs["centralAC"]? 2:1);
  var non_ac_factor = (1-inputs["percAC"]/100) * inputs["ntrlSlAr"] / 2;
  var premisesContacts = 0;
  //TODO: FIXME: premisesContacts increases with decrease in nEmp! Should divide by total_emp instead?
  if (nEmp>0){
    premisesContacts = (accessContacts + stairsElev + crowding ) * (1 + (shiftDelta)) * (1+0.2*((inputs["nCW"]) ? 1 : 0)) * (1-mskWeight*inputs["msk"]);
    premisesContacts *= (1+0.1*ac_factor-0.1*non_ac_factor);
  }
  var nominal_office_infra_raw_score = 31;
  var nominal_office_infra_scaled_score = 800;

  // Other meeting spaces
  var total_meeting_spaces = inputs["mtngSpts"] + inputs["oMtngSpts"];
  var score_other_spaces = 0.5 * total_meeting_spaces * Math.max(1-0.1*(inputs["freqCln"]*Math.min(1, inputs["nHskpngStff"])), 0.5) * (1-mskWeight*inputs["msk"]);
  var score_office_infra = 0;
  if (premisesContacts+score_other_spaces>0 && !isNaN(premisesContacts+score_other_spaces)){
    score_office_infra = nominal_office_infra_raw_score*nominal_office_infra_scaled_score/(premisesContacts + score_other_spaces);
  }
  score_office_infra = clipAndRound_bounds(score_office_infra);

  var sg_office_infra = "";
  var count = 0;
  var give_suggestion = (score_office_infra!=100);
  if (nEmp==0){
    sg_office_infra = "You have entered the total number of employees in a shift to be zero. This is invalid. Please go back and re-enter the correct number of employees for each shift.";
  } else if (shiftDelta && sg_office_infra<number_of_suggestions && give_suggestion) {
    count += 1;
    sg_office_infra = (sg_office_infra=="") ? "" : sg_office_infra + "<br>";
    sg_office_infra += "Minimum gap of 1 hour between consecutive shifts is recommended.";
  } else if (score_office_infra<70 && sg_office_infra<number_of_suggestions && give_suggestion){
    count += 1;
    sg_office_infra = (sg_office_infra=="") ? "" : sg_office_infra + "<br>";
    sg_office_infra += "Consider encouraging more employees to work from home or shifts";
  } else if (inputs["nEleDinf"]<2 && sg_office_infra<number_of_suggestions && give_suggestion) {
    sg_office_infra = (sg_office_infra=="") ? "" : sg_office_infra + "<br>";
    sg_office_infra += "Consider cleaning the lifts more often";
  } else if (sg_office_infra<number_of_suggestions && score_office_infra>90) {
    sg_office_infra = (sg_office_infra=="") ? "" : sg_office_infra + "<br>";
    sg_office_infra += "Well done!";
  }

  // Toilet scores
  var nGntsTlt = nM + nOth/2.0; 
  var nLdsTlt = nF + nOth/2.0; 
  var avgTltVstsPrDy = 5; 
  var avgTltDrtn = 4;
  var tltCnctrtnHrs = 4; 

  var nominal_raw_aggrToiletSc = 800;
  var nominal_scaled_aggrToiletSc = 1;

  var aggrToiletSc = 1000;
  if (inputs["nGntsT"]>0 || inputs["nLdsT"]>0){
    var cRateGentsToilet = nGntsTlt * avgTltVstsPrDy * avgTltDrtn * (Math.max(0.5, (1.0 - 0.1*inputs["tClnFreq"]))) * (1.0 - 0.1*inputs["spPrsnt"] - 0.1*(inputs["noHT"]? 1 : 0)) / (tltCnctrtnHrs*60*inputs["nGntsT"]);
    var cRateLadiesToilet = nLdsTlt * avgTltVstsPrDy * avgTltDrtn * (Math.max(0.5, (1.0 - 0.1*inputs["tClnFreq"]))) * (1.0 - 0.1*inputs["spPrsnt"] - 0.1*(inputs["noHT"]? 1 : 0)) / (tltCnctrtnHrs*60*inputs["nLdsT"]);
    aggrToiletSc = nominal_raw_aggrToiletSc*nominal_scaled_aggrToiletSc/(Math.max(cRateLadiesToilet, cRateGentsToilet)+0.001);
  }
  var effctvnss_factor_dinf = (Math.min(inputs["nDinf"], 10)/10)*((inputs["typeDisinfect"])? 1.5 : 1);
  var effctvnss_factor_sntn = (Math.min(inputs["freqCln"], 2)/2)*((inputs["typeSanitation"])? 1.5 : 1);

  var score_sanitation = Math.min(aggrToiletSc, 1000)*0.7 + 100*(effctvnss_factor_dinf+effctvnss_factor_sntn);
  score_sanitation = clipAndRound_bounds(score_sanitation);

  var sg_sanitation = "";
  give_suggestion = (score_sanitation!=100);
  if (!inputs["nGntsT"] && !inputs["nLdsT"]){
    sg_sanitation = "High score. But do you really have no toilets in your workplace?";
  } else if (effctvnss_factor_dinf<0.75 && give_suggestion){
    sg_sanitation = "Disinfect the premises more often.";
  } else if (effctvnss_factor_sntn<0.75 && give_suggestion){
    sg_sanitation = "Clean the premises more often.";
  } else if (aggrToiletSc<700 && give_suggestion) {
    sg_sanitation = "Disinfect toilets more often or consider reducing the employees per shift";
  } else if (score_sanitation > 90) {
    sg_sanitation = "Well done!";
  }

  // Sick Rooms/Isolation Ward
  var manufacturing_plant = (inputs["NOE"]==3);
  var score_sickRoom = 100*(inputs["iQS"]*2 + inputs["amblnc"] + inputs["lHsptl"]*2 + inputs["emrgncResp"] + inputs["hl"] + 
                            inputs["imdtFM"] + inputs["alrg"] * Math.max( 0, (1.0 - inputs["lstUpdtTime"]/60)) + inputs["medInsurance"]);
  if (manufacturing_plant){
    score_sickRoom *= 8/10;
    score_sickRoom += (inputs["sfRsrtPlnt"] ? 50:0) + (inputs["onstDsMngt"] ? 50:0) + (inputs["strlzBxs"] ? 50:0) + (inputs["mskPPE"] ? 50:0);
  }

  var score_isolation = clipAndRound_bounds(score_sickRoom);
  var count = 0;
  // This list of suggestions is exhaustive now; update sg_isolation if a new field is added to score
  var sg_isolation = "";
  if (!inputs["sfRsrtPlnt"] && manufacturing_plant){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "You do not have a standard operating procedure for safe restarting of your plant.";
  }
  if (!inputs["onstDsMngt"] && manufacturing_plant && count<number_of_suggestions){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "You do not have an industrial on-site disaster management plan.";
  }
  if (!inputs["strlzBxs"] && manufacturing_plant && count<number_of_suggestions){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Sterilise boxes and wrapping brought into factory premises.";
  }
  if (!inputs["mskPPE"] && manufacturing_plant && count<number_of_suggestions){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Provide face protection shields along with masks and PPEs.";
  }
  if (!inputs["iQS"]){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Designate a well-ventilated place for immediate quarantine.";
  }
  if (!inputs["lHsptl"] && count<number_of_suggestions){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Prepare a list of COVID-19 ready hospitals.";
  } 
  if (!inputs["amblnc"] && count<number_of_suggestions){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Keep an ambulance on stand-by.";
  } 
  if (!inputs["emrgncResp"] && count<number_of_suggestions) {
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Give instructions to transport department on COVID-19 emergency.";
  }
  if (!inputs["medInsurance"] && count<number_of_suggestions) {
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Get medical insurance for all employees";
  }
  if (!inputs["hl"] && count<number_of_suggestions) {
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Consider having a dedicated COVID-19 helpline.";
  }
  if (Math.max( 0, (1.0 - inputs["lstUpdtTime"]/60)) < 0.5 && count <number_of_suggestions) {
      count += 1;
      sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
      sg_isolation += "Update medical history of employees more often.";
  }
  if (!inputs["imdtFM"] && count<number_of_suggestions){
    count += 1;
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Consider preparing a list of immediate family members and caretakers of employees.";
  }
  if (!inputs["alrg"] && count<number_of_suggestions){
    sg_isolation = (sg_isolation=="") ? "" : sg_isolation + "<br>";
    sg_isolation += "Consider preparing a list of employees' medical history.";
  }
  if (sg_isolation=="" && score_isolation>89.9){
    sg_isolation = "Well done!";
  }

  // Canteen/Pantry
  var time_brkfst = 15; // In minutes
  var time_lnch = 30;
  var time_snck = 15;
  var time_wtr = 2;
  var num_wtr_sought = 5;
  var prsnl_area = 28; // In sq. feet: Approx. 3 feet radius
  var pvtl_hrs = 4;
  var nOutside = 0;

  var score_cafeteria_scaled = 1000;
  var nominal_raw_cafeteria_score = 2;
  var nominal_scaled_cafeteria_score = 700;

  var mtng_brkfst = 0;
  var mtng_lnch = 0;
  var mntg_snck = 0;
  var mntg_wtr = 0;

  if (inputs["cntnArea"]>0 && ( inputs["cntn"] || inputs["seatingFood"] )) {
    //FIXME: the nOutside gets a disproportionate share of nEmp
    nOutside = Math.max(0, nEmp - inputs["nLnch"] - inputs["nEmpHL"]); 
    mtng_brkfst = (Math.min(inputs["nBrkfst"], inputs["mxCntnPpl"]) * time_brkfst * prsnl_area) / (inputs["cntnArea"] * (inputs["dBrkfst"] ? inputs["dBrkfst"] : 60));
    mtng_lnch = (Math.min(inputs["nLnch"], inputs["mxCntnPpl"]) * time_lnch * prsnl_area) / (inputs["cntnArea"] * (inputs["dLnch"] ? inputs["dLnch"] : 90));
    mntg_snck = (Math.min(inputs["nSnck"], inputs["mxCntnPpl"]) * time_snck * prsnl_area) / (inputs["cntnArea"] * (inputs["dSnck"] ? inputs["dSnck"] : 60));
    if (inputs["nWS"]>0){
      mntg_wtr = (nEmp * time_wtr * num_wtr_sought * prsnl_area) / (inputs["nWS"] * inputs["cntnArea"] * pvtl_hrs *  60);
    }
  } else {
    nOutside = Math.max(0, nEmp - inputs["nEmpHL"]);
    if (inputs["nWS"]>0){
      mntg_wtr = (nEmp * time_wtr * num_wtr_sought * prsnl_area) / (inputs["nWS"] * 144 * pvtl_hrs *  60);
    }
  }

  var score_cafeteria_scaled = 0;
  if (nEmp>0){
    var ac_factor_canteen = 1+0.1*(inputs["cntnACOp"]);
    var score_cafeteria = ((mtng_brkfst*(inputs["nBrkfst"]/nEmp) + mtng_lnch*(inputs["nLnch"]/nEmp) + mntg_snck*(inputs["nSnck"]/nEmp) + mntg_wtr)*(ac_factor_canteen) + (inputs["nEmpHL"]*0.25/nEmp) + (nOutside*2/nEmp) + (nOutside*0.5*(inputs["extFSP"])/nEmp));
    score_cafeteria = score_cafeteria * Math.max((1 - 0.1*( inputs["mlStggrd"] + inputs["freqCln"] - inputs["utnslShrd"])), 1/2);
    score_cafeteria_scaled = nominal_scaled_cafeteria_score*nominal_raw_cafeteria_score/score_cafeteria;
    // We prefer the score_cafeteria to be less than 2
  }

  var score_cafeteria_scaled = clipAndRound_bounds(score_cafeteria_scaled);
  var sg_cafeteria = "";
  give_suggestion =(score_cafeteria_scaled!=100);
  if ((!inputs["cntnArea"]>0 || !( inputs["cntn"] || inputs["seatingFood"] )) && nEmp>0){
    sg_cafeteria = "Canteen/pantry/kitchen seating area are not being used for food/beverages consumption. <br>Score is based on interaction during the following activities: <br>Using water dispenser, having lunch from outside and lunch brought from home.";
  } else if (nEmp==0){
    sg_cafeteria = "You have entered the total number of employees in a shift to be zero. This is invalid.";
  } else if (nOutside/nEmp > 0.5 && score_cafeteria_scaled<60 ){
    sg_cafeteria = "You have too many outside contacts during lunch time. Encourage employees to bring lunch from home or provide lunch on premises."
  // FIXME: re-look at the following suggestion: check if the seating area per person is indeed the reason 
  } else if (score_cafeteria_scaled<70){
    sg_cafeteria = "You have overcrowding in your canteen/pantry seating area. <br>Consider staggered canteen/pantry timings or encourage employees to work from home.";
  } else if (score_cafeteria_scaled > 90 && sg_cafeteria == "") {
    sg_cafeteria = "Well done!";
  }

  // Mobility
  var nLM = nEmp - inputs["nHM"] - inputs["nMM"];
  if (nLM < 0){
    nLM =0;
  }
  var score_mobility = 0;
  if (nLM+inputs["nMM"]+inputs["nHM"]+inputs["nExtM"]>0){
    score_mobility = ((0.25*nLM + 0.5*inputs["nMM"] + inputs["nHM"] + 1.5*inputs["nExtM"])/(nLM+inputs["nMM"]+inputs["nHM"]+inputs["nExtM"])) * (1-mskWeight*inputs["msk"]);
  }
  var nominal_raw_score_mobility = 0.85;
  var nominal_scaled_score_mobility = 1000;
  score_mobility = (1-score_mobility)*nominal_scaled_score_mobility/nominal_raw_score_mobility;
  score_mobility = clipAndRound_bounds(score_mobility);

  var sg_mobility = "";
  give_suggestion = (score_mobility!=100);
  if (!inputs["msk"] && give_suggestion){
    sg_mobility = "Consider mandating masks while interacting with other employees";
  } else if (score_mobility<90){
    sg_mobility = "Consider allowing a few high mobility users to work from home";
  } else {
    sg_mobility = "Well done!";
  }

  var score_meetings = 1000;
  // Meetings
  // TODO: nMPD is now post-covid. Adjust the formula accordingly!!!
  if (inputs["nMPD"] && inputs["avgMS"]){
    //score_meetings = 1000*total_emp/(inputs["nMPD"] * Math.pow(inputs["avgMS"], 1.2) * (1-mskWeight*inputs["msk"]));
    score_meetings = 1000*nEmp/(inputs["nMPD"] * Math.pow(inputs["avgMS"], 1.2) * (1-mskWeight*inputs["msk"]));
  }
  score_meetings = clipAndRound_bounds(score_meetings);
  score_meetings = (score_meetings > 95)? 95: score_meetings;

  var sg_meetings = "";
  give_suggestion = (score_meetings!=100);
  if (!inputs["msk"] && give_suggestion){
    sg_meetings = "Consider making mask mandatory in all the meetings.";
  } else if (score_meetings<70){
    sg_meetings = "Consider shifting to online meetings";
  } else if (inputs["avgMS"]>5 && give_suggestion) {
    sg_meetings = "Consider reducing number of participants in meetings involving physical presence.";
  } else if (sg_meetings == "" && score_meetings >= 90) {
    sg_meetings = "Well done!";
  }

  // Outside contacts
  var score_outside = 1000;
  var sg_outside = "";
  if (inputs["nVstrs"] && inputs["nEmpCstmr"]){
    score_outside =  100*nEmp/(inputs["nVstrs"] * Math.pow(inputs["nEmpCstmr"]+inputs["nDlvrHndlng"], 0.1) * (1-mskWeight*inputs["msk"]) * (1-0.1*(inputs["glvs"]+inputs["dsgntdCstmrPlc"])));
    score_outside = clipAndRound_bounds(score_outside);
    give_suggestion = (score_outside!=100);
    if (score_outside >= 900) {
     sg_outside = "Well done!";
    }
    else if (!inputs["msk"] && give_suggestion){
      sg_outside = "Consider using masks while meeting visitors";
    } else if (!inputs["glvs"] && give_suggestion){
      sg_outside = "Consider wearing gloves while meeting visitors";
    } else if (score_outside<700) {
      sg_outside = "Consider reducing the number of employees that meet outsiders";
    }
  }
  else{
    sg_outside = "No outside interactions";
  }

  // Epidemic related precautions
  var meets_shift_requirement = 1;
  // Uncomment this in the production code.
  if (0<inputs["NOE"] && inputs["NOE"]<=2){
    meets_shift_requirement = ((total_emp*0.33>=nEmp) ? 1:0) ; 
  }

  var empPerHS = 15;
  var adequateHS = ((inputs["nHsS"] > (inputs["tArea"]/1000)) && (inputs["nHsS"] > nEmp/empPerHS) ) ? 1 : 0
  var score_epidemic = 0;
  score_epidemic = (1000/18)*(inputs["tempScreening"] + inputs["faceCover"] + inputs["adqFaceCover"] + inputs["newShfts"] + inputs["informCZEmp"] + inputs["informWFH"] +
                        (inputs["tchFree"]? 1:0.5)*adequateHS + Math.min(inputs["nStrHrDinf"]*0.5, 1) + inputs["encrgStrws"] + inputs["dclrtn"] +
                        Math.min(inputs["nDinf"], 10)/10 + inputs["smkZS"] + meets_shift_requirement + inputs["vrtlMtng"] + inputs["brrrs"] +
                        ((inputs["nWsB"] > (inputs["nFloors"]*2) ? 1 : 0)) + inputs["nASapp"]/total_emp + inputs["advAvdLPM"]);                              

  score_epidemic = clipAndRound_bounds(score_epidemic);
                                
  var sg_epidemic = "";
  give_suggestion = (score_epidemic!=100);
  count = 0;
  if (!meets_shift_requirement){
    count += number_of_suggestions;
    sg_epidemic = "For your establishment, there is a maximum 33% attendance requirement which is not met.";
  }
  if (!inputs["tempScreening"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider temperature screening of all employees on entry and exit.";
  }
  if (!inputs["faceCover"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider mandating face cover inside the office premises.";
  }
  if (!inputs["adqFaceCover"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider procuring adequate number of facecovers for employees.";
  }
  if (!inputs["newShfts"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider dividing the work timings into more shifts.";
  }
  if (!((inputs["nHsS"] > (inputs["tArea"]/1000)) ? 1 : 0)  && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider increasing hand sanitiser dispensing stations.";
  }
  if (inputs["nDinf"]<=5 && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider disinfecting the office more often.";
  }
  if (!inputs["smkZS"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider sealing smoking zones.";
  }
  if (!(inputs["nWsB"] > (inputs["nFloors"]*2) ? 1 : 0) && count <number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider having more warning sign boards for \'no spitting\'.";
  }
  if (!inputs["advAvdLPM"] && count <number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Consider avoiding large physical meetings.";
  }
  if (!inputs["vrtlMtng"] && count <number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Make arrangements to have virtual meetings.";
  }
  if (!inputs["brrrs"] && count <number_of_suggestions && give_suggestion){
    count += 1;
    sg_epidemic = (sg_epidemic=="") ? "" : sg_epidemic + "<br>";
    sg_epidemic += "Put barriers in place between open working spaces.";
  }
  if (sg_epidemic=="" && score_epidemic>90){
    sg_epidemic = "Well done!";
  }

  // Advertisement and outreach
  var score_adv_outrch = (1000/12)*(inputs["covidPage"] + inputs["faq"] + inputs["sPers"] + inputs["hkTrn"] + inputs["hkEqp"] + inputs["advSclDis"] + inputs["advWFHVul"] + inputs["snzCvr"] + inputs["sPrgm"] + inputs["pstrs"] + inputs["advNoHS"] + (inputs["nWsB"] > (inputs["nFloors"]*2) ? 1 : 0));
  score_adv_outrch = clipAndRound_bounds(score_adv_outrch);

  // This list of suggestions is exhaustive now; update sg_adv_outrch if a new field is added to score
  var sg_adv_outrch = "";
  give_suggestion = (score_adv_outrch!=100);
  count = 0;
  if (!inputs["hkEqp"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch += "House-keeping staff need to be equipped with masks, aprons, gloves, etc.";
  }
  if (!inputs["hkTrn"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "House-keeping staff are critical for COVID-19 management. Conduct trainings on COVID-19 related precautions for them.";
  }
  if (!inputs["covidPage"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Prepare a COVID-19 awareness page.";
  }
  if (!inputs["faq"] && count<number_of_suggestions && give_suggestion){    
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Provide access to COVID-19 FAQ to the employees.";
  }
  if (!inputs["sPers"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Designate a cleanliness, awareness and safety champion.";
  }
  if (!inputs["advSclDis"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Advise employees to maintain social distance.";
  }
  if (!inputs["advWFHVul"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Advise vulnerable employees to work from home.";
  }
  if (!inputs["snzCvr"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Advise employees to cover their sneezes and coughs.";
  }
  if (!inputs["sPrgm"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Organise special programmes to sensitise employees on COVID-19 epidemic.";
  }
  if (!inputs["pstrs"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Put up posters on hygiene in common places.";
  }
  if (!inputs["advNoHS"] && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Advise employees to use non-contact greetings.";
  }
  if (!(inputs["nWsB"] > (inputs["nFloors"]*2) ? 1 : 0) && count<number_of_suggestions && give_suggestion){
    count += 1;
    sg_adv_outrch = (sg_adv_outrch=="") ? "" : sg_adv_outrch + "<br>";
    sg_adv_outrch += "Have more warning sign boards for \'no spitting\'.";
  }
  if (sg_adv_outrch=="" && score_adv_outrch>=90){
    sg_adv_outrch = "Well done!";
  }

  // Company Transport
  var cmpnTrnsprtUsrs = inputs["trvlr5K"]+inputs["trvlr10K"]+inputs["trvlr10Kplus"];
  var F = Math.max( (inputs["bsCpctAct"]) ? inputs["bsCpctCur"]/inputs["bsCpctAct"] : 0, (inputs["mnBsCpctAct"]) ? inputs["mnBsCpctCur"]/inputs["mnBsCpctAct"] : 0, 
                    (inputs["vnCpctAct"]) ? inputs["vnCpctCur"]/inputs["vnCpctAct"] : 0, (inputs["svCpctAct"]) ? inputs["svCpctCur"]/inputs["svCpctAct"] : 0,
                    (inputs["crCpctAct"]) ? inputs["crCpctCur"]/inputs["crCpctAct"] : 0);
  var score_company_transport = F * Math.max((1-0.1*(inputs["nTrnsptSnt"]+inputs["drvSrnd"]+inputs["hsVhcl"]+inputs["vhclSnt"]+inputs["noACVhcl"]+inputs["tempScreeningVhcl"])), 0.5) * (1-mskWeight*inputs["mskMndt"])
                                * (inputs["trvlr5K"]*5 + inputs["trvlr10K"]*(10/1.25) + inputs["trvlr10Kplus"]*(15/1.5));

  // Self-owned Vehicles
  var slfTrnsprtUsrs = inputs["trvlr5Kslf"]+inputs["trvlr10Kslf"]+inputs["trvlr10Kplusslf"];
  var F_slf = 1
  if (inputs["noPlnR"] && inputs["no2plusTrvl"]){
    F_slf = 1/2;
  }
  
  var score_self_transport = F_slf * (1-0.1*inputs["hsLbb"]) * (1-mskWeight*inputs["mskCar"])
                             * (inputs["trvlr5Kslf"]*5 + inputs["trvlr10Kslf"]*(10/1.25) + inputs["trvlr10Kplusslf"]*(15/1.5));

  // Walking
  var score_walk = inputs["nWlk"] * ((1-inputs["hsLbb"])*0.2 + inputs["hsLbb"]*0.1)*(1-mskWeight*inputs["mskWlk"]);

  // Public Transport
  var pubTrnsprtUsrs = inputs["trvlr5Kpub"]+inputs["trvlr10Kpub"]+inputs["trvlr10Kpluspub"];
  
  var score_public_transport = (1-0.1*inputs["hsLbb"]) * (1-mskWeight*inputs["mskPub"]) *
                                 (inputs["trvlr5Kpub"]*5 + inputs["trvlr10Kpub"]*(10/1.25) + inputs["trvlr10Kpluspub"]*(15/1.5));
  
  var score_total_transport = 1;
  var score_total_transport_scaled = 1000;
  var nominal_scaled_score_total_transport = 800;
  var nominal_raw_score_total_transport = 3.5;

  if (cmpnTrnsprtUsrs + slfTrnsprtUsrs + inputs["nWlk"] + pubTrnsprtUsrs > 0){
    score_total_transport = (score_company_transport + score_self_transport + score_walk + score_public_transport)/
                            (cmpnTrnsprtUsrs + slfTrnsprtUsrs + inputs["nWlk"] + pubTrnsprtUsrs);

    score_total_transport_scaled = nominal_scaled_score_total_transport*nominal_raw_score_total_transport/score_total_transport;
  }
  
  score_total_transport_scaled = clipAndRound_bounds(score_total_transport_scaled);

  var sg_transport = "";
  give_suggestion = (score_total_transport_scaled!=100);
  if (cmpnTrnsprtUsrs + slfTrnsprtUsrs + inputs["nWlk"] + pubTrnsprtUsrs == 0 && give_suggestion){
    sg_transport = "High score. But do you really have no one traveling to your workplace?";
  } else if ((inputs["mskMndt"]+inputs["mskCar"]+inputs["mskWlk"]+inputs["mskPub"])<3 && give_suggestion){
    sg_transport = "Consider using mask while travelling";
  } else if (F>0.5 && give_suggestion){
    sg_transport = "Consider reducing numbers per journey";
  } else if ((inputs["nTrnsptSnt"]+inputs["drvSrnd"]+inputs["hsVhcl"]+inputs["vhclSnt"]+inputs["noACVhcl"])<3 && inputs["cmpnTrnsprtUsrs"]>0 && give_suggestion){
      sg_transport = "Consider more use of hand sanitiser etc.";
  } else if (score_total_transport_scaled>90) {
    sg_transport = "Well done!";
  }

  onSuccess("Successfully generated workplace readiness score!");
  var sg_total = "For general suggestions, see below"
  var score_total = score_office_infra + score_epidemic +  score_isolation + 
      score_adv_outrch + score_mobility + score_meetings +  score_outside + score_cafeteria_scaled + score_sanitation + score_total_transport_scaled
  
  var overall_report = "<div class='overall_report p-3'><b>Your overall COVID-19 readiness score is ";
  overall_report += score_total  + " / 1000"
  overall_report += "<br>Your percentile score among your type of establishment is "
  overall_report +=  score_total/10;
  overall_report += "</div><br><br>"

	var resTable = "";
	resTable += "<table class='table table-bordered'><thead class='rTableHead'>";
	resTable += "<th>Readiness category</th><th class='scoreCol'>Score (Max. 100)</th>";
  resTable += "<th>Specific suggestions for each readiness category</th></thead>";
  resTable += "<tr><td>Infrastructure</td><td class='scoreCol' bgcolor=" + scoreColor(score_office_infra) + ">" + clipto95 (score_office_infra) + "</td><td>" + sg_office_infra + "</td></tr>"
  resTable += "<tr><td>Epidemic related: Precautions</td><td class='scoreCol' bgcolor=" + scoreColor(score_epidemic) + ">" + score_epidemic + "</td><td>" + sg_epidemic + "</td></tr>"
  resTable += "<tr><td>Epidemic related: Awareness and readiness</td><td class='scoreCol' bgcolor=" + scoreColor(score_isolation) + ">" + score_isolation + "</td><td>" + sg_isolation + "</td></tr>"
  resTable += "<tr><td>Epidemic related: Advertisement and outreach</td><td class='scoreCol' bgcolor=" + scoreColor(score_adv_outrch) + ">" + score_adv_outrch + "</td><td>" + sg_adv_outrch + "</td></tr>"
  resTable += "<tr><td>Transportation</td><td class='scoreCol' bgcolor=" + scoreColor(score_total_transport_scaled) + ">" + clipto95(score_total_transport_scaled) + "</td><td>" + sg_transport + "</td></tr>"
  resTable += "<tr><td>Employee interactions: Mobility</td><td class='scoreCol' bgcolor=" + scoreColor(score_mobility) + ">" + clipto95(score_mobility) + "</td><td>"+ sg_mobility +"</td></tr>"
  resTable += "<tr><td>Employee interactions: Meetings</td><td class='scoreCol' bgcolor=" + scoreColor(score_meetings) + ">" + clipto95(score_meetings) + "</td><td>" + sg_meetings + "</td></tr>"
  resTable += "<tr><td>Employee interactions: Outside contacts</td><td class='scoreCol' bgcolor=" + scoreColor(score_outside) + ">" + clipto95(score_outside) + "</td><td>" + sg_outside + "</td></tr>"
  resTable += "<tr><td>Canteen/pantry</td><td class='scoreCol' bgcolor=" + scoreColor(score_cafeteria_scaled) + ">" + clipto95(score_cafeteria_scaled) + "</td><td>" + sg_cafeteria + "</td></tr>"
	resTable += "<tr><td>Hygiene and sanitation</td><td class='scoreCol' bgcolor=" + scoreColor(score_sanitation) + ">" + clipto95(score_sanitation) + "</td><td>" + sg_sanitation + "</td></tr>"
  //resTable += "<tr><td>Total <br>(Max. score: 1000)</td><td>" + score_total + "</td><td>" + sg_total + "</td></tr>"
  resTable += "</table>";
  document.getElementById("scoreTable").innerHTML = overall_report + resTable;

  var outputs = new Object();
  outputs["Infrastructure"] = score_office_infra;
  outputs["Epidemic related: Precautions"] = score_epidemic;
  outputs["Epidemic related: Awareness and readiness"] = score_isolation;
  outputs["Epidemic related: Advertisement and outreach"] = score_adv_outrch;
  outputs["Transportation"] = score_total_transport_scaled;
  outputs["Employee interactions: Mobility"] = score_mobility;
  outputs["Employee interactions: Meetings"] = score_meetings;
  outputs["Employee interactions: Outside contacts"] = score_outside;
  outputs["Canteen/pantry"] = score_cafeteria_scaled;
  outputs["Hygiene and sanitation"] = score_sanitation;
  outputs["Total"] = score_total;
 
  var suggestions = new Object();
  suggestions["Infrastructure"] = sg_office_infra;
  suggestions["Epidemic related: Precautions"] = sg_epidemic;
  suggestions["Epidemic related: Awareness and readiness"] = sg_isolation;
  suggestions["Epidemic related: Advertisement and outreach"] = sg_adv_outrch;
  suggestions["Transportation"] = sg_transport;
  suggestions["Employee interactions: Mobility"] = sg_mobility;
  suggestions["Employee interactions: Meetings"] = sg_meetings;
  suggestions["Employee interactions: Outside contacts"] = sg_outside;
  suggestions["Canteen/pantry"] = sg_cafeteria;
  suggestions["Hygiene and sanitation"] = sg_sanitation;

  log_json = JSON.stringify({'uuid': set_uuid(), 'inputs': inputs, 'outputs': outputs, "suggestions": suggestions});
  window['logData'] = log_json;
  post_function(log_json);
}

function post_function(log_json)
{
  var orgName = document.getElementById("cmpName").value;
  $("#orgName").text("Organisation name: " + orgName);

  $.ajax({
    type: "POST",
    url: window.location.href+"api/update",
    data: "data="+log_json,
    success: function(data){
        if ($("#uuid_status").val() == "Valid UUID"){
          $("#subUUID").text('Your submission ID is: ' + $("#uuid").val());
          $("#display_uuid").show();
        } else {
          $("#subUUID").text('Your submission ID is: ' + data['uuid']);
          $("#display_uuid").show(); 
        }
    }
  });
  return "";
}

function openPage(pageName, elmnt, color) {
  // Hide all elements with class="tabcontent" by default */
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the background color of all tablinks/buttons
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

  // Show the specific tab content
  document.getElementById(pageName).style.display = "block";

  // Add the specific color to the button used to open the tab content
  elmnt.style.backgroundColor = color;
}

// Get the element with id="defaultOpen" and click on it
//document.getElementById("defaultOpen").click();
document.getElementById("QnTab").click();

function handleFormSubmit(formObject) {
  /* google.script.run.withSuccessHandler(onSuccess).processForm(formObject); */
  /* document.getElementById("myForm").reset(); */
  var resOK = calcScore();
  if (resOK < 0 ) { return; }
  openPage('Scores', document.getElementById("ScoresTab"), '#774c60')
  $("#reCalcBtn").html("Revise inputs");
  $("#noPrint").show()
  $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function reEnter() {
	openPage('Qn', document.getElementById("QnTab"), '#2c4268')
  $('html, body').animate({ scrollTop: 0 }, 'fast');
}

function submitForm() {
  var resOK = calcScore();
  if (resOK < 0 ) { return; }
  post_function(window["logData"]);
  //console.log(retData['uuid']);
  //console.log((window["logData"]).inputs)
  /* Disable until we get email sending working
  var alertMsg = "Thank you for submitting the data. "
  var email = document.getElementById("emailAddr").value;
  if (email) {
    alertMsg += "You will receive an email with a link to your submitted form data at " + email;
  }   window.alert(alertMsg);*/
  printPage();
}

function printPage(){
  $("#header").hide()
  $(".tablink").hide()
  $(".sub-btn").hide()
  $("#noPrint").hide()
  $("#footer").hide()
  $(".tabcontent").css('color','black');
  $("#Scores").css('background-color','white');
  $(".rTableHead").css('background-color','white');
  $(".overall_report").css('background-color','#e6f2ff');
  window.print()
  $("#header").show()
  $(".tablink").show()
  $(".sub-btn").show()
  $("#noPrint").show()
  $("#footer").show()
  $(".tabcontent").css('color','white');
  $("#Scores").css('background-color','#774c60');
  $(".rTableHead").css('background-color','#2c4268');
  $(".overall_report").css('background-color','#0086b3');
}

