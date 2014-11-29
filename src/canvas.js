// --------------------------- API --------------------------------------

cbm.Canvas = function(canvasId) {
    this.canvas = new fabric.Canvas(canvasId)
    this.init()
}

cbm.Canvas.prototype.add = function(element, object) {
    this.addCanvasElement(element)
    var id = this.nextId++
    element.id = id
    this.components[id] = {element: element, object: object}
    if (object && object.name)
	this.componentsNameToIdMap[object.name] = id
    element.on('selected', function() { 
	this.updateInspectorWithObject(id) 
    }.bind(this))
}

cbm.Canvas.prototype.getElementByName = function(name) {
    return this.componentsNameToIdMap[name] ? 
	this.components[this.componentsNameToIdMap[name]].element : undefined
}

cbm.Canvas.prototype.setInterval = function(stepFn, interval) {
    setInterval(function() { 
	for (id in this.components) {
	    var component = this.components[id]
	    var object = component.object
	    if (object && object[stepFn]) {
		object[stepFn]() 
		this.refreshObjectValue(id)
	    }
	}
	this.canvas.renderAll() 
    }.bind(this), interval)
}

// --------------------------- Implementation --------------------------------------

cbm.Canvas.prototype.addCanvasElement = function(obj, name) {
    this.canvas.add(obj)
}

// focus inspector to 
cbm.Canvas.prototype.updateInspectorWithObject = function(id) {
    this.activeObjectId = id
    var component = this.components[id]
    //var frms = obj.formulas
    var element = component.element
    this.setObjectFormulaInspectorText(codeToString(component.object))
    this.setObjectValueInspectorText(valueToString(component.object))
    if (this.canvas.getActiveObject() !== element)
	this.canvas.setActiveObject(element)
    this.canvas.renderAll()
}

cbm.Canvas.prototype.setObjectFormulaInspectorText = function(text) {
    this.objectFormulaInspector.setValue(text)
}

cbm.Canvas.prototype.setObjectValueInspectorText = function(text) {
    this.objectValueInspector.setValue(text)
}

cbm.Canvas.prototype.refreshObjectValue = function(id) {
    var component = this.components[id]
    var actId = this.activeObjectId
    if (actId == id)
	this.setObjectValueInspectorText(valueToString(component.object))
}

cbm.Canvas.prototype.init = function() {
    
    this.components = {}
    this.componentsNameToIdMap = {}
    this.nextId = 1
    this.codeView = true

    var buttonPos = 5

    // buttons
    var button = new fabric.LabeledRect({visible: true,
					left: 5,
					top: buttonPos,
					fill: '#aaa',
					width: 110,
					height: 25,
					label: 'Code View'})
    this.addCanvasElement(button, 'code-view')
    button.on('mouseup', function() { 
	var x = 700, y = 200
	if (!this.codeView)
	    y = 700
	this.codeView = !this.codeView
	this.objectFormulaInspector.setSize(x, y)  
	this.objectValueInspector.setSize(x, y)     
    }.bind(this))
    
    // inspectors    
    var objectFormulaInspectorWidth = 1000
    var objectFormulaInspectorHeight = this.codeView ? 700 : 200
    this.objectFormulaInspector = CodeMirror.fromTextArea(document.getElementById('code-inspector'))
    this.objectFormulaInspector.setSize(objectFormulaInspectorWidth, objectFormulaInspectorHeight)
    this.objectValueInspector = CodeMirror.fromTextArea(document.getElementById('value-inspector'))
    this.objectValueInspector.setSize(this.canvas.width - objectFormulaInspectorWidth, objectFormulaInspectorHeight)
    this.objectFormulaInspectorTitle = new fabric.Text('Code', {visible: true, left: 20, top: 530, fontFamily: 'Monaco', fontSize: 14, fill: 'black'})
    this.addCanvasElement(this.objectFormulaInspectorTitle, 'formula-inspector-title')
    this.objectValueInspectorTitle = new fabric.Text('Values', {visible: true, left: this.objectFormulaInspectorTitle.left + objectFormulaInspectorWidth, top: 530, fontFamily: 'Monaco', fontSize: 14, fill: 'black'})
    this.addCanvasElement(this.objectValueInspectorTitle, 'value-inspector-title')

}

codeToString = function(obj) {
    var res = ''
    for (p in obj) {
	if (p.charAt(0) === '_')
	    break
	var v = obj[p]
	var t = typeof v
	if (t === 'function')
	    res += p + ': ' + v +  "\n\n"
    }
    return res
}

valueToString = function(obj) {
    var res = ''
    for (p in obj) {
	if (p.charAt(0) === '_')
	    break
	var v = obj[p]
	var t = typeof v
	if (t !== 'function')
	    res += p + ': ' + JSON.stringify(v) +  "\n"
    }
    return res
}
