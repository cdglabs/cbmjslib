var kb = new cbm.KB(true)
var canvas = new cbm.Canvas('c')

//kb.opt_debugOn = true
//kb.opt_alsoTryUntautologizedSpecs = true

var oLeft = 150, oTop = 20, font1 = 'Lucida Handwriting'

var myAppComponent = {
    name: 'myApp',
    run: function(userInput) {
	this.userInput = userInput
	kb.findByMeaning(
	    '(programParsesInputInto ?THAT CharacterString Date)',
	    this, this.dateParserFound) 
},
    dateParserFound: function(dateParser) {
	// parse the input
	this.dateParser = dateParser
	this.userDateArray = dateParser.getDate(this.userInput) 
	if (this.userDateArray) {
	    // convert into date object
	    this.userDate = this.dateArrayToDate(this.userDateArray)
	    kb.findByMeaning(
		'(and (programVariableRepresents ?THAT ?THING ?_)' 
		   + '(knowsAbout ?THING' 
		        + '(SubcollectionOfWithRelationToFn Astrology focusOfTheory ZodiacConstellation)))',
		this, this.zodiacExpertFound)
	}
},
    zodiacExpertFound: function(zodiacExpert) {
	this.zodiacExpert = zodiacExpert
	// compute zodiac sign 
	this.userSign = zodiacExpert.getZodiacSign(this.userDate) 
	canvas.getElementByName('signName').text = this.userSign
	kb.findByMeaning(
	    '(and (isa ?THAT ?TYPE)'
	       + '(typePrimaryFunction ?TYPE InternetSearching programUsed-Generic)'
	       + '(behaviorCapable ?THING'
		    + '(SubcollectionOfWithRelationToTypeFn ElectronicDataSearching ' 
		         + 'informationSought VisualImage) searchEngineUsed))', 
	    this, this.imageSearchEngineFound)
},
    imageSearchEngineFound: function(imageSearchEngine) {
	this.imageSearchEngine = imageSearchEngine
	// get a url to img of zoadiac sign
	this.signImgUrl = imageSearchEngine.getImgUrl(this.userSign) 
	canvas.getElementByName('signImg').acyclicSet('src', this.signImgUrl)
	kb.findByMeaning(
	    '(and (programVariableRepresents ?THAT ?THING ?_)' 
	       + '(knowsAbout ?THING ZodiacConstellation)'
	       + '(knowsAbout ?THING' 
		    + '(SubcollectionOfWithRelationFromTypeFn CalendarDay birthDay' 
		         + '(CollectionIntersection2Fn FamousHuman ComputerScientist))))', 
	    this, this.csFamousPeopleExpertFound)
},
    csFamousPeopleExpertFound: function(csFamousPeopleExpert) {
	this.csFamousPeopleExpert = csFamousPeopleExpert
	// get a uri to img of a CS person with that sign
	this.csPersonImgUrl = csFamousPeopleExpert.getCSPersonImgUrl(this.userSign) 
	canvas.getElementByName('csPersonImg').acyclicSet('src', this.csPersonImgUrl)
},
    dateArrayToDate: function(dateArray) {
	return new Date(dateArray[0], dateArray[1], dateArray[2])
}
}
canvas.add(new fabric.LabeledRect({label: ' myApp', top: oTop, left: oLeft + 250, width: 650, height: 500, fill: '#e0e0e0', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), myAppComponent)

var dateParserComponent = {
    name: 'dateParser',
    spec: function() { 
	return '(and (primaryFunction ?THIS SemanticParsing programUsed)' 
	          + '(programVariableIsaFunctionWithArg1 ?THIS ?Y CharacterString)' 
	          + '(programVariableIsaFunctionWithOutput ?THIS ?Z Date))'
},
    getDate: function(date) {
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
	return dateObj
}
}

canvas.add(new fabric.LabeledRect({label: dateParserComponent.name, top: oTop + 50, left: oLeft - 50, width: 200, height: 200, fill: '#f0f0e0', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), dateParserComponent)

var zodiacExpertComponent = {
    name: 'zodiacExpert',
    spec: function() { 
	return '(and (programVariableRepresents ?THIS ?THING ?_)' 
	          + '(expertRegarding ?THING' 
	              + '(SubcollectionOfWithRelationToFn Astrology focusOfTheory ZodiacConstellation)))' 
},
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
    spec: function() { 
	return '(isa ?THIS ImageSearchEngine)'
},
    getImgUrl: function(zodiac) {
	return zodiac ? (zodiac + '.png') : ''
}
}

canvas.add(new fabric.LabeledRect({label: imageSearchComponent.name, top: oTop + 50, left: oLeft + 950, width: 200, height: 250, fill: '#ff6666', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), imageSearchComponent)

var csPersonsZodiacExpertComponent = {
    name: 'csPersonsZodiacExpert',
    spec: function() { 
	return '(and (programVariableRepresents ?THIS ?THING ?_)' 
	          + '(knowsAbout ?THING ZodiacConstellation)' 
	          + '(knowsAbout ?THING (SubcollectionOfWithRelationFromTypeFn CalendarDay birthDay' 
	              + '(CollectionIntersection2Fn FamousHuman ComputerScientist))))' 
},
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

kb.addComponent(csPersonsZodiacExpertComponent)
kb.addComponent(imageSearchComponent)
kb.addComponent(zodiacExpertComponent)
kb.addComponent(dateParserComponent)

canvas.add(new fabric.LabeledRect({label: csPersonsZodiacExpertComponent.name, top: oTop + 325, left: oLeft + 925, width: 300, height: 200, fill: '#4080e0', strokeWidth: 4, stroke: 'gray', opacity: 0.8}), csPersonsZodiacExpertComponent)

canvas.add(new fabric.Text('Your Birthdate:', {top: oTop + 100, left: oLeft + 300, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black'}))
canvas.add(new fabric.IText('_', {top: oTop + 100, left: oLeft + 600, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black', textBackgroundColor: '#ffff66'}), {name: 'input'})
canvas.add(new fabric.Text('Your Sign:', {top: oTop + 200, left: oLeft + 300, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black'}))
canvas.add(new fabric.Text('?', {top: oTop + 200, left: oLeft + 600, fontFamily: font1, fontSize: 30, padding: 5, fill: 'black', textBackgroundColor: '#ffff66'}), {name: 'signName'})
canvas.add(new fabric.Image(newImageElement('img1', 'blank.png'), {top: oTop + 275, left: oLeft + 350, width: 200, height: 200}), {name: 'signImg'})
canvas.add(new fabric.Image(newImageElement('img2', 'blank.png'), {top: oTop + 275, left: oLeft + 600, width: 200, height: 200}), {name: 'csPersonImg'})

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


