kb = new cbm.KB(true)
var canvas = new cbm.Canvas('c')

var timeSourceComponent = {
    name: 'Time Authority',
    spec: function() { 
	return '(programVariableRepresents ?THIS ?_ Clock)' 
},
    getTime: function() { return new Date().getTime() }
}

kb.addComponent(timeSourceComponent)
canvas.add(new fabric.LabeledRect({label: 'Time Authority', width: 200, height: 200, left: 300, top: 200, fill: 'green'}), timeSourceComponent)

var hourHandE = new fabric.Triangle({width: 15, height: 50, left: 800, top: 300, fill: 'black', originX: 'center', originY: 'bottom'})
var minuteHandE = new fabric.Triangle({width: 10, height: 100, left: 800, top: 300, fill: 'black', originX: 'center',  originY: 'bottom'})
var secondHandE = new fabric.Triangle({width: 5, height: 150, left: 800, top: 300, fill: 'red', originX: 'center', originY: 'bottom'})

var clockGUIComponent = {
    run: function() {
	kb.findByMeaning(
	    '(and (programVariableRepresents ?THAT ?_ ?SOMETYPE)' 
	       + '(typeBehaviorCapable-DeviceUsed ?SOMETYPE (MeasuringFn Time-Quantity)))', 
	    this, this.onFindByMeaningResponse) },
    onFindByMeaningResponse: function(found) {
	this.clock = found
	this.epoch = this.clock.getTime() 
	this.date = new Date(this.epoch)
	this.seconds = this.date.getSeconds()
	this.minutes = this.date.getMinutes()
	this.hours = this.date.getHours() % 12
	this.hourAngle = (this.hours + this.minutes / 60) * 30
	this.minuteAngle = ((this.minutes + this.seconds / 60) * 6)
	this.secondAngle = this.seconds * 6
	canvas.getElementByName('hourHand').angle = this.hourAngle
	canvas.getElementByName('minuteHand').angle = this.minuteAngle
	canvas.getElementByName('secondHand').angle = this.secondAngle
    }
}

canvas.add(new fabric.Circle({radius: 175, left: 625, top: 125, fill: 'gray'}), clockGUIComponent)
canvas.add(new fabric.Triangle({width: 15, height: 50, left: 800, top: 300, fill: 'black', originX: 'center', originY: 'bottom'}), {name: 'hourHand'})
canvas.add(new fabric.Triangle({width: 10, height: 100, left: 800, top: 300, fill: 'black', originX: 'center',  originY: 'bottom'}), {name: 'minuteHand'})
canvas.add(new fabric.Triangle({width: 5, height: 150, left: 800, top: 300, fill: 'red', originX: 'center', originY: 'bottom'}), {name: 'secondHand'})
canvas.add(new fabric.Text('12', {left: 783, top: 130, fill: 'black', textBackgroundColor: 'gray'}))
canvas.add(new fabric.Text('3', {left: 940, top: 275, fill: 'black', textBackgroundColor: 'gray'}))
canvas.add(new fabric.Text('6', {left: 790, top: 420, fill: 'black', textBackgroundColor: 'gray'}))
canvas.add(new fabric.Text('9', {left: 640, top: 275, fill: 'black', textBackgroundColor: 'gray'}))

canvas.setInterval('run', 1000)
