var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
const fs = require('fs');
const async = require('async');
var app = express();

function translateDateToNum(stringDay){
	var numberDay;
	switch(stringDay) {
		case 'Sunday':
		numberDay = 0;
		break;
		case 'Monday':
		numberDay = 1;
		break;
		case 'Tuesday':
		numberDay = 2;
		break;
		case 'Wednesday':
		numberDay = 3;
		break;
		case 'Thursday':
		numberDay = 4;
		break;
		case 'Friday':
		numberDay = 5;
		break;
		case 'Saturday':
		numberDay = 6;
		break;
	}
	return numberDay;
}



app.get('/scrape', function (req, res){
	var jsonHours = JSON.parse('{"0":[], "1": [], "2": [], "3": [], "4": [], "5": [], "6": []}');
	var currentUrl;
	var urlFileString = fs.readFileSync('urls.txt').toString();
	var urlList = urlFileString.split(/\r?\n/);
	
	var fetch = function(currentUrl, callback) {
		request(currentUrl, function(error, response, html){
			
			if(!error){

				// load entire HTML structure in $
				var $ = cheerio.load(html);

				// Cafe Name - Virginia 
				// Get text from between title tags, convert to string, take off extraneous information

				var location = $('head > title').text().toString().split('-')[0].trim();
				
				var hours;

				

				$('.content-box').filter(function(){
					

					var data = $(this);

					hours = data.children();
					

					for (i=0; i < hours.length; i++) {
						if (hours[i].prev.data !== undefined){
							var dayHours = hours[i].prev.data.toString().trim();
							
							
							// if multi day hours provided
							console.log(dayHours);
							if (dayHours.indexOf('-') != dayHours.lastIndexOf('-')){
								
								// String form: firstDay-lastDay: openTime (am/pm) - closeTime (am/pm)

								var multiDay = dayHours.split('-');

								var firstDay = translateDateToNum(multiDay[0].trim());

								var lastDay = translateDateToNum(multiDay[1].split(":")[0].trim());

								

								if (! dayHours.includes('Closed')) {
									
									
									var hoursSplit = dayHours.split('-');
									var openTime = hoursSplit[1].split(' ')[1] + ' ' + hoursSplit[1].split(' ')[2];
									var closeTime = hoursSplit[2].trim();

									// Back around list case; example Friday - Sunday

									if (lastDay == 0) {
										for (j=firstDay; j < 6; j++) {
											jsonHours[j].push({ "name": location, "open": openTime, "close": closeTime});
										}
										jsonHours[0].push({ "name": location, "open": openTime, "close": closeTime});

									}
									else {
										for (j=firstDay; j <= lastDay; j++){
											jsonHours[j].push({ "name": location, "open": openTime, "close": closeTime});

										}
									}
									// find the range of days and get open and close times
								}
								else {

									// don't add anything to our map?
								}
							}
							else {
								//String form: dayOfTheWeek: openTime (am/pm) - closeTime (am/pm)

								var daySplit = dayHours.split(':');
								
								// First element should be singular day of the week
								var dayOfTheWeek = daySplit[0];
								
								var dayNum = translateDateToNum(dayOfTheWeek);
								

								if (! dayHours.includes('Closed')) {
									var hoursSplit = dayHours.split('-');
									var openTime = hoursSplit[0].split(' ')[1] + ' ' + hoursSplit[0].split(' ')[2];
									var closeTime = hoursSplit[1].trim();
									
									jsonHours[dayNum].push({ "name": location, "open": openTime, "close": closeTime});
								}
								else {
								// something for when a dining hall is closed
							}
						}
					}

				}

			})

			}
			
			else {
				console.log(error);
				callback(err);
			}


		callback();
		})

	}
	// loop through each URL sequentially (NOT async) and add to JSON object
	


	async.map(urlList, fetch, function(err){
		if (err) {
			console.log('A url failed to be scraped');
		} else {
			res.send(jsonHours);
		}
	});	

})

app.listen('8081')

console.log('Listening on port 8081');

exports = module.exports = app;