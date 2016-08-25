var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
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
	

	// Needs to be switched to grab a list of URLs
	var url = "http://virginia.campusdish.com/Locations/AldermanCafe.aspx";

	// send a request for each URL in the list

	// add for loop
	request(url, function(error, response, html){

		if(!error){
			
			// load entire HTML structure in $
			var $ = cheerio.load(html);

			// Cafe Name - Virginia 
			// Get text from between title tags, convert to string, take off extraneous information

			var location = $('head > title').text().toString().split('-')[0].trim();
			
			var hours;

			var json = { };

			$('.content-box').filter(function(){
				

				var data = $(this);

				hours = data.children();
				

				for (i=0; i < hours.length; i++) {
					if (hours[i].prev.data !== undefined){
						var dayHours = hours[i].prev.data.toString().trim();

						if (dayHours.indexOf('-') != dayHours.lastIndexOf('-')){
							
							// String form: firstDay-lastDay: openTime (am/pm) - closeTime (am/pm)
							
							var multiDay = dayHours.split('-');

							var firstDay = multiDay[0];
							var lastDay = multiDay[1];


							console.log("multiple days listed");

							if (! dayHours.includes('Closed')) {
								// find the range of days and get open and close times
							}
							else {
								// do something else for closed case

								// don't add anything to the map?
							}
						}
						else {
							//String form: dayOfTheWeek: openTime (am/pm) - closeTime (am/pm)

							var daySplit = dayHours.split(':');
							
							// First element should be singular day of the week
							var dayOfTheWeek = daySplit[0];
							
							console.log(dayOfTheWeek);

							if (! dayHours.includes('Closed')) {
								var hoursSplit = dayHours.split('-');
								var openTime = hoursSplit[0].split(' ')[1] + ' ' + hoursSplit[0].split(' ')[2];
								var closeTime = hoursSplit[1].trim();
								
								console.log("Open: " + openTime);
								console.log("Close: " + closeTime);
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
			
			console.log("inside error");
			console.log(error);
		}
	})
})

app.listen('8081')

console.log('Listening on port 8081');

exports = module.exports = app;