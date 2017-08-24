//grab from log last position
const LOG_FULL_PATH = "log.csv";
const NAMES_FULL_PATH = "names.csv";
const TEST_MODE = false;

var getRow = getTheRow();
if(TEST_MODE) alert("getRow: " + getRow);
var namesLine = getRow+1;
//grab the data for the row number we just extracted
			var i=1;
			var load =  "CODE:";
			load +=  "SET !TIMEOUT_STEP 1" + "\n"; 
			load +=  "SET !TIMEOUT_PAGE 300" + "\n"; 
			load +=  "SET !EXTRACT NULL" + "\n"; 
			load +=  "SET !DATASOURCE " + NAMES_FULL_PATH + "\n"; 
			load +=  "SET !DATASOURCE_COLUMNS 4" + "\n"; 
			load +=  "SET !DATASOURCE_LINE " + namesLine + "\n"; 
			load +=  "SET !extract {{!col1}}" + "\n";
			load +=  "ADD !extract {{!col2}}" + "\n";
			load +=  "ADD !extract {{!col3}}" + "\n";
			load +=  "ADD !extract {{!col4}}" + "\n";
			iimPlay(load);
			value=iimGetLastExtract(0).replace(" ", "<SP>");
			var inputInfo = value.split("[EXTRACT]");
			if (TEST_MODE) {
				alert(inputInfo[0]);
				alert(inputInfo[1]);
				alert(inputInfo[2]);
				alert(inputInfo[3]);
			}




//fill the data
var load;
load = "CODE:";
load +=  "SET !TIMEOUT_STEP 1" + "\n";
load += "URL GOTO=bulletmail.org/register" + "\n";
load += "SET !EXTRACT NULL" + "\n";
load += "SET !DATASOURCE names.csv" + "\n";
load += "SET !DATASOURCE_COLUMNS 1" + "\n";
load += "SET !DATASOURCE_LINE 2" + "\n";
load += "SET !extract {{!col1}}" + "\n";
load += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:NoFormName ATTR=NAME:name CONTENT=" + inputInfo[1] + "\n";
load += "TAG POS=1 TYPE=INPUT:TEXT FORM=NAME:NoFormName ATTR=NAME:email CONTENT=" + inputInfo[2] + "\n";
load += "SET !ENCRYPTION NO" + "\n";
load += "TAG POS=1 TYPE=INPUT:PASSWORD FORM=NAME:NoFormName ATTR=ID:password_field CONTENT=" + inputInfo[3] + "\n";
load += "TAG POS=1 TYPE=INPUT:PASSWORD FORM=NAME:NoFormName ATTR=NAME:password_confirm CONTENT=" + inputInfo[3] + "\n";
load += "TAG POS=1 TYPE=INPUT:CHECKBOX FORM=NAME:NoFormName ATTR=NAME:terms CONTENT=YES" + "\n";
load += "FRAME F=6" + "\n";
load += "TAG POS=1 TYPE=DIV ATTR=ROLE:presentation&&CLASS:recaptcha-checkbox-checkmark&&TXT:" + "\n";
iimPlay(load);





function getTheRow() {
	
			var i=1;
			var load =  "CODE:";
			load +=  "SET !EXTRACT NULL" + "\n"; 
			load +=  "SET !DATASOURCE " + LOG_FULL_PATH + "\n"; 
			load +=  "SET !DATASOURCE_COLUMNS 2" + "\n"; 
			load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
			load +=  "SET !extract {{!col1}}" + "\n";
			load +=  "ADD !extract {{!col2}}" + "\n";
			iimPlay(load);
			value=iimGetLastExtract(0);
			prevValue = value;

			while (value != "") {
				i++;	
				load =  "CODE:";
				load +=  "set !EXTRACT NULL" + "\n"; 
				load +=  "SET !DATASOURCE " + LOG_FULL_PATH + "\n"; 
				load +=  "SET !DATASOURCE_COLUMNS 2" + "\n"; 
				load +=  "SET !DATASOURCE_LINE " + i + "\n"; 
				load +=  "SET !extract {{!col1}}" + "\n";
				load +=  "ADD !extract {{!col2}}" + "\n";
				iimPlay(load);
				prevValue = value;
				value=iimGetLastExtract(0);
			}
			if (TEST_MODE) alert(prevValue);
			var lastLog = prevValue.split("[EXTRACT]");
			var getRow = parseInt(lastLog[0])+1;
			if (TEST_MODE) alert(getRow);
			
			return getRow;
	
}









//after this captcha is entered manually, and we click the next macro


