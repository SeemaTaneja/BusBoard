import{createRequire} from "module";
const require = createRequire(import.meta.url);
import fetch from "node-fetch";
const prompt = require("prompt-sync")();
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  
let postcodeUser = prompt("Please enter your postcode:");
//const postcode = "w1a1aa";
let postCodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcodeUser}`);
let postCodeData = await postCodeResponse.json()
while(!postCodeResponse.ok || postCodeData.result.region !== "London"){
    try{
        postCodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcodeUser}`);
        postCodeData = await postCodeResponse.json()
        if(!postCodeResponse.ok){
            logger.error(`Invalid postcode: ${postcodeUser}`);
            throw "It is a invaild postcode"
        } if(postCodeData.result.region !== "London"){
            logger.error(`It,s not a london postcode: ${postcodeUser}`);
            throw "This is not covered by tfl"
        }
    } catch(e){
        console.log(e);
        postcodeUser = prompt("Please enter the correct postcode:");
    }
}
//console.log(postCodeData);
const postCodeLat = postCodeData.result.latitude;
const postCodeLong = postCodeData.result.longitude;
logger.info(`postcodeLatitude: ${postCodeLat} ,postcodeLongitude: ${postCodeLong} `)
let radius = prompt("Enter your desired radius :");
//console.log(`${postCodeLat} , ${postCodeLong}`);
let busStopId = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${postCodeLat}&lon=${postCodeLong}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`);
let busStopIdInfo = await busStopId.json();
while( !busStopId.ok || busStopIdInfo.stopPoints.length < 2){
    try{
      busStopId = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${postCodeLat}&lon=${postCodeLong}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`);
      busStopIdInfo = await busStopId.json();
      if(!busStopId.ok){
        logger.error(`radius too large or not a number: ${radius}`);
        throw "You have not entered a number less than 86000";
    }
      if(busStopIdInfo.stopPoints.length < 2){
        logger.error(`radius not large enough: ${radius}`);
          throw "Not able to find atleast 2 bustop within this radius";
      }
    } catch(e){
        console.log(e);
        radius = prompt("Enter the another radius :");
    }   
}
//console.log(busStopIdInfo);
const stopPointArray = busStopIdInfo.stopPoints;
//console.log(stopPointArray);
const stopPointArray2 = [];
stopPointArray.forEach(stopPoint => stopPointArray2.push([stopPoint.naptanId , stopPoint.commonName , stopPoint.distance , stopPoint.indicator]));
stopPointArray2.forEach(id => logger.info(`Common name : ${id[1]} , Nepton Id : ${id[0]} , Indicator : $[3]`));
console.log(stopPointArray2);
console.log(`The nearest bus stop are ${stopPointArray2[0][1]} and ${stopPointArray2[1][1]} .`);
for(let i = 0; i<2 ; i++){
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointArray2[i][0]}/Arrivals`);
    const arrivals = await response.json()
    if(arrivals.length === 0){
        console.log("There are not any bus coming to this bus stop");
        logger.info(`Bus stop closure ${stopPointArray2[0][1]} , ${stopPointArray2[1][1]}`);
    }
    arrivals.sort((a,b) => a.timeToStation - b.timeToStation);
    const arrival5 = arrivals.slice(0,5);
    arrival5.forEach(arrival => console.log(`The bus is going to ${arrival.destinationName} in ${arrival.timeToStation} seconds`));
    let directionoption = prompt("Would you like to get the directions to bus stop? (yes/no)");
if(directionoption === 'yes'){
    const direction = await fetch(`https://api.tfl.gov.uk/Journey/JourneyResults/${postcodeUser}/to/${stopPointArray2[i][0]}?timeIs=Arriving&journeyPreference=LeastInterchange&accessibilityPreference=NoRequirements&walkingSpeed=Slow&cyclePreference=None&bikeProficiency=Easy`);
    const result = await direction.json();
    logger.info(`https://api.tfl.gov.uk/Journey/JourneyResults/${postcodeUser}/to/${stopPointArray2[i][0]}?timeIs=Arriving&journeyPreference=LeastInterchange&accessibilityPreference=NoRequirements&walkingSpeed=Slow&cyclePreference=None&bikeProficiency=Easy`);
    for(let j = 0 ; j <result.journeys[0].legs[0].instruction.steps.length ; j++){
        console.log(result.journeys[0].legs[0].instruction.steps[j].descriptionHeading,result.journeys[0].legs[0].instruction.steps[j].description);
    }
}
}

//for(let i = 0 ; i < arrivals.length ; i++){
   // const arrival = arrivals[i];
    //console.log(`Bus is arriving at ${arrival.destinationName} in ${arrival.timeToStation} seconds`);
//}