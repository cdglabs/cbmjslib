cbm = {}

// --------------------------- API --------------------------------------

cbm.KB = function(initCommonSenseKB) {
    this.components = {}
    if (initCommonSenseKB)
	this.initCommonSenseKB()
}

cbm.KB.prototype.addComponent = function(component) { 
    var name = component.name
    if (!this.components[name]) {
	this.components[name] = component 
	// if component has property specs add implicit specs once here...
	var implicitThisSpec, implicitPropSpecs = [], specProps = []
	if (component.spec) 
	    implicitThisSpec = '(isa ?THIS ProgramVariable-CBM) '
	for (p in component) {
	    var specP = p + '_spec'
	    if (component[specP]) {
		var pU = p.toUpperCase()
		specProps.push(p)
		var pSpecVar = '?' + pU
		implicitPropSpecs.push('(isa ' + pSpecVar + ' ProgramVariable-CBM) (programVariableHasProperty ?THIS ' + pSpecVar + ') (programVariableHasName ' + pSpecVar + ' "' + p + '") ')
	    }
	}
	if (implicitThisSpec || implicitPropSpecs.length > 0) {
	    component.spec = component.spec || function() { return '' }
	    var fnCode = "(function() { return '(and ' + '" + (implicitThisSpec || '') + "' + this.spec() " + (implicitPropSpecs.length > 0 ? (" + ' " + implicitPropSpecs.join(' ') + "'") : "")
	    specProps.forEach(function(p) { 
		var specP = p + '_spec'
		var pU = p.toUpperCase()
		fnCode += " + this." + specP + "().replace(/\\?(\\w+)/g, function(match, a) { return '?' + ((a === '_' || a === '" + pU + "') ? '' : '" + pU + "-') + a }) + ' '" 
	    })
	    fnCode += "+ ')' })"
	    //console.log(fnCode)
	    component._fullSpec = eval(fnCode)
	} 
    }
}

cbm.KB.prototype.findByName = function(name) { 
    for (n in this.components) {
	var c = this.components[n]
	if (c.name === name)
	    return c
    }
    return undefined
}

cbm.KB.prototype.findByAPIName = function(name) { 
    for (n in this.components) {
	var c = this.components[n]
	for (p in c) {
	    if (p === name)
		return c
	}
    }
    return undefined
}

cbm.KB.prototype.findByMeaning = function(query, asker, onFound) {
    if (this.commonSenseKBUninitiated())
	return undefined
    var checkComponents = []
    for (n in this.components) {
	var c = this.components[n]
	if (c._fullSpec)
	    checkComponents.push(c)    
    }    
    if (this.opt_debugOn)
	console.log("findByMeaning issued. query: " + query)
    return this.findByMeaningH(query, asker, onFound, checkComponents)
}

cbm.KB.prototype.findByMeaningH = function(query, asker, onFound, checkComponents) {
    var self = this
    if (checkComponents.length == 0)
	return undefined
    var component = checkComponents.pop()
    var onReturn = function(answer) { 
	//console.log('a:' + answer + ' q:' + query)
	if (answer) 
	    onFound.call(asker, component) 
	else
	    self.findByMeaningH(query, asker, onFound, checkComponents) }
    this.askProver(query, true, onReturn, asker, component)    
    return undefined
}

cbm.KB.prototype.askByMeaning = function(query, asker, askee, isBoolean, onReturn) {
    if (this.commonSenseKBUninitiated())
	return undefined
    return this.askProver(query, isBoolean, onReturn, asker, askee)
}

// --------------------------- Implementation --------------------------------------

cbm.KB.prototype.commonSenseKBUninitiated = function() {
    if (this.commonSenseReady)
	return false
    if (!this.commonSenseErrorReported) {
	this.commonSenseErrorReported = true
	alert('Common sense server is not running!')
    }
    return true
}

// following code to interface with Prover to run a spec query:
cbm.KB.prototype.initCommonSenseKB = function() {
    //console.log('defining specQuery')
    var proverI = new WebSocket("ws://127.0.0.1:8080/")
    proverI.queryId = 0
    proverI.nextQueryId = function() { var res = this.queryId++; return res } 
    this.queries = {}
    this.proverI = proverI
    this.specQueriesMt = ''

    proverI.onopen = function()  {
	//console.log("WS connection opened!")
	this.commonSenseReady = true
    }.bind(this)
	    
    proverI.onmessage = function (evt) {
	var message = evt.data
	var parts = message.split('|')
	var queryId = parts[0]  
	var res = parts[1]
	var queryInfo = this.queries[queryId]
	if (queryInfo) {
	    var isBoolean = queryInfo.isBoolean
	    if (isBoolean) 
		res = res === 'true'
	    else
		res = parseSpecQueryModel(res)
	    if (this.opt_debugOn) {
		console.log("query id: " + queryId + " is boolean: " + isBoolean + " result: " + res)
		console.log('res: ' + JSON.stringify(res) + ' reattmpt=' + queryInfo.reattempt)
	    }
	    var asker = queryInfo.asker
	    var onReturn = queryInfo.onReturn

	    if (!res && /*isBoolean &&*/ !queryInfo.reattempt && !this.opt_untautologizeSpecs && this.opt_alsoTryUntautologizedSpecs) {
		var proverlQuery = '(#$and ' + queryInfo.query + ' ?TMPVAR0)'
		this.askProverHelper({queryId: this.proverI.nextQueryId(), query: proverlQuery, asker: asker, isBoolean: isBoolean, onReturn: onReturn, reattempt: true})
	    } else
		onReturn.call(asker, res)
	    delete this.queries[queryId]
	}
    }.bind(this)
    
    proverI.onclose = function() {
	console.log("WS connection closed!")
	this.commonSenseReady = false
	this.commonSenseKBUninitiated()
    }.bind(this)
    
    proverI.onerror = function(err) {
	console.log("WS error!")
	this.commonSenseReady = false
	this.commonSenseKBUninitiated()
    }.bind(this)    
}

cbm.KB.prototype.askProver = function(query, isBoolean, onReturn, asker, askee, queryId) {
    if (!this.commonSenseReady)
	return undefined
    onReturn = onReturn || function(answer) { console.log('answer is: ' + answer) }
    queryId = queryId || this.proverI.nextQueryId()
    var thisModel, specs, objectHasSpecs, proverlQueryOrig
    if (asker && asker._fullSpec) {
	var thisSpecs = asker._fullSpec()
	if (thisSpecs)
	    specs = //'(and ' + 
	thisSpecs 
	//+ ')'
    }
    if (askee) {
	var askeeSpecs = askee._fullSpec()
	//console.log(askeeSpecs)
	askeeSpecs = askeeSpecs.replace(/\?(\w)/g, function(match, a) { return '?' + (a === '_' ? '' : 'THAT-') + a }).replace(/\?THAT\-THIS/g, '?THAT')
	//console.log(askeeSpecs)
	if (askeeSpecs)
	    specs = specs ? ('(and ' + askeeSpecs + ')') : askeeSpecs
	//console.log('replace: ' + askeeSpecs.replace(/\?THAT\-THAT/g, '?THAT'))
	//console.log('specs: ' + specs)
    }
    // for boolean query just return false if no askee specs:
    if (specs) {
	var opStr = (!isBoolean && this.opt_conjoinGivenSpecsAndQuery) ? 'and' : 'implies'
	proverlQueryOrig = '(' + opStr + ' ' + specs + ' ' + query + ')'
    } else
	proverlQueryOrig = query
    // add annoying prefix '#$':
    proverlQueryOrig = proverlQueryOrig.replace(/(\s|\()([a-zA-Z])/g, function(match, a, b) { return a + '#$' + b })
    // remove wild card symbol '$_':
    var proverlQuerySplit  = proverlQueryOrig.split('\?_')
    var tmpVarCtr = 1
    var proverlQuery = proverlQuerySplit[0]
    for (var i = 1; i < proverlQuerySplit.length; i++)
	proverlQuery += '?TMPVAR' + i + proverlQuerySplit[i]
    // Prover API is silly and returns false on a Tautology:
    if (this.opt_untautologizeSpecs/* && isBoolean*/)
	proverlQuery = '(#$and ' + proverlQuery + ' ?TMPVAR0)'
    if (this.opt_debugOn)
	console.log('asker: ' + JSON.stringify(asker) + ' askee: ' + JSON.stringify(askee) + 'asker/askees specs: ' + specs + ' isBoolean: ' + isBoolean + ' spec query: ' + query + ' proverl query (' + queryId + '): ' + proverlQuery)
    this.askProverHelper({queryId: queryId, query: proverlQuery, asker: asker, isBoolean: isBoolean, onReturn: onReturn})
    return undefined
}	    

cbm.KB.prototype.askProverHelper = function(queryInfo) {
    //console.log(queryInfo)
    var queryId = queryInfo.queryId
    this.queries[queryId] = queryInfo
    this.proverI.send('query|' + queryId + '|' + (queryInfo.isBoolean ? 'boolean' : 'value') + '|' + this.specQueriesMt + '|' + queryInfo.query)
}

//HACK FIXME: need a parser...
parseStringToJSValue = function(val) {
    //if (proverToValueMap)
    //    val = proverToValueMap[val] || val
    var res = Number(val)
    if (res)
	return res
    return val
}

parseSpecQueryModel = function(model) {
    var res = undefined
    var bindings = model == '' ? [] : model.split(',')
    for (var i = 0; i < bindings.length; i++) {
	var binding = bindings[i].split(':')
	var varName = binding[0]
	var varValue = parseStringToJSValue(binding[1])
	if (!res) res = {}
	res[varName] = varValue
    }
    return res
}
