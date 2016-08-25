var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/scrape', function (req, res){
	

	console.log("inside scrape");
	// Needs to be switched to grab a list of URLs (from JSON map)
	var url = "http://virginia.campusdish.com/Locations/AldermanCafe.aspx";

	// send a request for each URL in the list

	request(url, function(error, response, html){

		if(!error){
			console.log("no error");
			var $ = cheerio.load(html);

			var hours;
			var json = { };

			$('.content-box').filter(function(){
				console.log('Found hours block');

				var data = $(this);

				hours = data.children();
				console.log(hours.length);		

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