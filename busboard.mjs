import{createRequire} from "module";
const require = createRequire(import.meta.url);
import fetch from "node-fetch";
const prompt = require("prompt-sync")();
let postcodeUser = prompt("Please enter your postcode:");
//const postcode = "w1a1aa";
let postCodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcodeUser}`);
let postCodeData = await postCodeResponse.json()
while(!postCodeResponse.ok || postCodeData.result.region !== "London"){
    try{
        postCodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcodeUser}`);
        postCodeData = await postCodeResponse.json()
        if(!postCodeResponse.ok){
            throw "It is a invaild postcode"
        } if(postCodeData.result.region !== "London"){
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
let radius = prompt("Enter your desired radius :");
//console.log(`${postCodeLat} , ${postCodeLong}`);
let busStopId = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${postCodeLat}&lon=${postCodeLong}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`);
let busStopIdInfo = await busStopId.json();
while( !busStopId.ok || busStopIdInfo.stopPoints.length < 2){
    try{
      busStopId = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${postCodeLat}&lon=${postCodeLong}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`);
      busStopIdInfo = await busStopId.json();
      if(!busStopId.ok){
        throw "You have not entered a number less than 86000";
    }
      if(busStopIdInfo.stopPoints.length < 2){
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
stopPointArray.forEach(stopPoint => stopPointArray2.push([stopPoint.naptanId , stopPoint.commonName , stopPoint.distance]));
console.log(stopPointArray2);
console.log(`The nearest bus stop are ${stopPointArray2[0][1]} and ${stopPointArray2[1][1]} .`);
for(let i = 0; i<2 ; i++){
    const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopPointArray2[i][0]}/Arrivals`);
    const arrivals = await response.json()
    arrivals.sort((a,b) => a.timeToStation - b.timeToStation);
    const arrival5 = arrivals.slice(0,5);
    arrival5.forEach(arrival => console.log(`The bus is going to ${arrival.destinationName} in ${arrival.timeToStation} seconds`));
}
//for(let i = 0 ; i < arrivals.length ; i++){
   // const arrival = arrivals[i];
    //console.log(`Bus is arriving at ${arrival.destinationName} in ${arrival.timeToStation} seconds`);
//}