var kb = new cbm.KB(true)
var canvas = new cbm.Canvas('c')

var oLeft = 150, oTop = 20, font1 = 'Lucida Handwriting'
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

var myAppComponent = {
    name: 'myApp',
    run: function(userInput) {
	// parse the input
	this.dateParser = kb.findByAPIName('getDate')
	this.dateParser.getDate(userInput)
	kb.askByMeaning(
	    '(and (programVariableHasProperty ?THAT ?THAT-GETDATE)' 
	       + '(programVariableIsaFunctionWithOutput ?THAT-GETDATE ?DATE ?_)' 
	       + '(zodiacSignDateRange ?SIGN (DayOfYearFn ?BEGIN-MONTH ?BEGIN-DAY) (DayOfYearFn ?END-MONTH ?END-DAY))'
	       + '(laterThanOrCooriginatingWith (DayFn ?END-DAY (MonthFn ?END-MONTH (YearFn 1776))) ?DATE)'
	       + '(laterThanOrCooriginatingWith ?DATE (DayFn ?BEGIN-DAY (MonthFn ?BEGIN-MONTH (YearFn 1776)))))',
	    this, this.dateParser, false, this.dateParserInfoReceived) 
    },
    dateParserInfoReceived: function(answer) {
	if (answer) {
	    this.answer = answer
	    this.userSign = answer.SIGN.replace('-TheSign', '')
	    canvas.getElementByName('signName').text = this.userSign
	    // get a url to img of zoadiac sign
	    this.signImgUrl = (kb.findByAPIName('getImgUrl').getImgUrl)(this.userSign) 
	    canvas.getElementByName('signImg').acyclicSet('src', this.signImgUrl)
	    // get a uri to img of a CS person with that sign
	    this.csPersonImgUrl = (kb.findByAPIName('getCSPersonImgUrl').getCSPersonImgUrl)(this.userSign) 
	    canvas.getElementByName('csPersonImg').acyclicSet('src', this.csPersonImgUrl)
	}
},
    dateArrayToDate: function(dateArray) {
	return new Date(dateArray[0], dateArray[1], dateArray[2])
}
}
canvas.add(new fabric.LabeledRect({label: ' myApp', top: oTop, left: oLeft + 250, width: 650, height: 500, fill: '#e0e0e0', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), myAppComponent)

var dateParserComponent = {
    name: 'dateParser',
    input: undefined,
    output: undefined,
    getDate: function(date) {
	this.input = date
	var dateObj = undefined
	if (date) {
	    date = date.match(/\//) ? date.split('/') : date.split('.')
	    if (date.length == 3) {
		var y = Number(date[2])
		var m = Number(date[1])
		var d = Number(date[0])
		if (y && m && d) {
		    m = m - 1
		    dateObj = [y, m, d]
		}
	    }
	}
	this.output = dateObj
	return dateObj
},
    getDate_spec: function() { 
	return  this.output ? 
	    '(programVariableIsaFunctionWithOutput ?GETDATE' 
	    + ' (DayFn ' + this.output[2] 
	    + ' (MonthFn ' + monthNames[this.output[1]] 
	    + ' (YearFn ' +  this.output[0] + '))) Date)' 
	    : undefined 
}
}

canvas.add(new fabric.LabeledRect({label: dateParserComponent.name, top: oTop + 50, left: oLeft - 50, width: 200, height: 200, fill: '#f0f0e0', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), dateParserComponent)

var zodiacExpertComponent = {
    name: 'zodiacExpert',
    getZodiacSign: function(born) {
	var zodiac = {
	    'Capricorn1':{'m':0,'d':20},
	    'Aquarius':{'m':1,'d':19},
	    'Pisces':{'m':2,'d':20},
	    'Aries':{'m':3,'d':20},
	    'Taurus':{'m':4,'d':21},
	    'Gemini':{'m':5,'d':21},
	    'Cancer':{'m':6,'d':22},
	    'Leo':{'m':7,'d':22},
	    'Virgo':{'m':8,'d':23},
	    'Libra':{'m':9,'d':23},
	    'Scorpio':{'m':10,'d':22},
	    'Sagittarius':{'m':11,'d':21},
	    'Capricorn2':{'m':11,'d':31}
	}
	var astrologicalSign = '', zodiacEnd, astrologicalSign
	for(z in zodiac) {
	    zodiacEnd = new Date(born.getFullYear(), zodiac[z]['m'], zodiac[z]['d'])
	    if (born <= zodiacEnd) { astrologicalSign = z; break }
	}
	if (astrologicalSign.match(/\d/)) astrologicalSign = astrologicalSign.replace(/\d/g,'')    
	return astrologicalSign
}
}

canvas.add(new fabric.LabeledRect({label: zodiacExpertComponent.name, top: oTop + 300, left: oLeft, width: 200, height: 200, fill: '#b0b0e0', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), zodiacExpertComponent)

var imageSearchComponent = {
    name: 'imageSearchEngine',
    getImgUrl: function(zodiac) {
	return zodiac ? (zodiac + '.png') : ''
}
}

canvas.add(new fabric.LabeledRect({label: imageSearchComponent.name, top: oTop + 50, left: oLeft + 950, width: 200, height: 250, fill: '#23f0aa', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), imageSearchComponent)

var csPersonsZodiacExpertComponent = {
    name: 'csPersonsZodiacExpert',
    getCSPersonImgUrl: function(zodiac) {
	var zodiacCSPersons = {
	    Capricorn: 'anita-borg',
	    Aquarius: 'alan-turing',
	    Pisces: 'jospeh-licklider',
	    Aries: 'wesley-clark',
	    Taurus: 'alan-kay',
	    Gemini: 'alonzo-church',
	    Cancer: 'adi-shamir',
	    Leo: 'marvin-minsky',
	    Virgo: 'stephen-wolfram',
	    Libra: 'guy-steele',
	    Scorpio: 'david-patterson',
	    Sagittarius: 'stephen-cook'
	}	
	return 'cs-' + zodiacCSPersons[zodiac] + '.png'
}
}

canvas.add(new fabric.LabeledRect({label: csPersonsZodiacExpertComponent.name, top: oTop + 325, left: oLeft + 925, width: 300, height: 200, fill: '#4080e0', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), csPersonsZodiacExpertComponent)

canvas.add(new fabric.Text('Your Birthdate:', {top: oTop + 100, left: oLeft + 300, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black'}))
canvas.add(new fabric.IText('_', {top: oTop + 100, left: oLeft + 600, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black', textBackgroundColor: '#ffff66'}), {name: 'input'})
canvas.add(new fabric.Text('Your Sign:', {top: oTop + 200, left: oLeft + 300, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black'}))
canvas.add(new fabric.Text('?', {top: oTop + 200, left: oLeft + 600, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black', textBackgroundColor: '#ffff66'}), {name: 'signName'})
canvas.add(new fabric.Image(newImageElement('img1', 'blank.png'), {top: oTop + 275, left: oLeft + 350, width: 200, height: 200}), {name: 'signImg'})
canvas.add(new fabric.Image(newImageElement('img2', 'blank.png'), {top: oTop + 275, left: oLeft + 600, width: 200, height: 200}), {name: 'csPersonImg'})

kb.addComponent(csPersonsZodiacExpertComponent)
kb.addComponent(imageSearchComponent)
kb.addComponent(zodiacExpertComponent)
kb.addComponent(dateParserComponent)

var once = true
canvas.getElementByName('input').on('editing:exited', function() { if (once) { once = false;  myAppComponent.run(this.text) } })

function newImageElement(name, imgSrc) {
    var divE = document.getElementById('dynamically-added')
    var imgE = document.createElement('img')
    var imgEId = 'element-' + name
    imgE.setAttribute('id', imgEId)
    imgE.setAttribute('src', imgSrc)
    divE.appendChild(imgE)
    return imgE
}


