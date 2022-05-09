import fetch from 'node-fetch';
import promptFn from "prompt-sync";
import winston from "winston";
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});
const prompt = promptFn();
let postcode = prompt("Please enter your postcode :");
const postcodeInfo = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
const postCodeResponse = await postcodeInfo.json();
while(!postcodeInfo.ok || postCodeResponse.result.region !== "London"){
      try{
        const postcodeInfo = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const postCodeResponse = await postcodeInfo.json();
        if(!postcodeInfo.ok){
            logger.error(`Invalid postcode : ${postcode}`);
            throw "It is an invalid postcode";
        }if(postCodeResponse.result.region !== "London"){
            logger.error(`Not a london postcode : ${postcode}`);
            throw "This is not covered by tfl";
        }
    }catch(error){
        console.log(error);
        postcode = prompt("Please enter correct london postcode :");
    }
}


