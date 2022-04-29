import fetch from "node-fetch";
const postcode = "w1a1aa";
const postCodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
const postCodeData = await postCodeResponse.json()
//console.log(postCodeData);
const postCodeLat = postCodeData.result.latitude;
const postCodeLong = postCodeData.result.longitude;
console.log(`${postCodeLat} , ${postCodeLong}`);
const busStopId = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${postCodeLat}&lon=${postCodeLong}&stopTypes=NaptanPublicBusCoachTram&radius=400`);
const busStopIdInfo = await busStopId.json();
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
    arrivals.forEach(arrival => console.log(`The bus is going to ${arrival.destinationName} in ${arrival.timeToStation} seconds`));
}
//for(let i = 0 ; i < arrivals.length ; i++){
   // const arrival = arrivals[i];
    //console.log(`Bus is arriving at ${arrival.destinationName} in ${arrival.timeToStation} seconds`);
//}