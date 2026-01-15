import { forceNavigator, forceNavigatorSettings, _d, sfObjectsGetData } from "./shared"
import { t } from "lisan"
const metaData = {}
let commandsHistory={}

const showElement = (element)=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		switch(element) {
			case "appMenu":
				chrome.tabs.executeScript(tabs[0].id, {code: 'document.getElementsByClassName("appLauncher")[0].getElementsByTagName("button")[0].click()'})
				break
			case "searchBox":
				chrome.tabs.executeScript(tabs[0].id, {code: `
					if(document.getElementById("sfnavSearchBox")) {
						document.getElementById("sfnavSearchBox").style.zIndex = 9999
						document.getElementById("sfnavSearchBox").style.opacity = 0.98
						document.getElementById("sfnavQuickSearch").focus()
					}
				`})
				break
		}
	})
}

/*
 Load the compact layout for an object.  Later in search, these fields will be displayed in the resutls.
 Loading the layout:   "/services/data/v56.0/compactLayouts?q=Case"
	Case.fieldItems[1].label - label
	Case.fieldItems[1].layoutComponents[0].details.name - field name
*/
const loadCompactLayoutForSobject = (sobject,options,compactLayoutFieldsForSobject,sendResponse=null) => {
	//console.log("loadCompactLayoutForSobject " + sobject  + ".  options:",options)
	let url ="https://" + options.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/compactLayouts?q=' + encodeURI(sobject)
	forceNavigator.getHTTP(url,"json", {"Authorization": "Bearer " + options.sessionId, "Accept": "application/json"})
	.then(response => {
		console.log("Request " +  url + " respnse : " , response)
		if(response && response.error) { console.error("response", response, chrome.runtime.lastError); return }
		let mainFields=""
		//response has one element called by the sobject name. identify it
		for (const responseKey in response) {
			if (response.hasOwnProperty(responseKey)) {
				response[responseKey].fieldItems.forEach(f=>{
					mainFields += f.layoutComponents[0].details.name + ","
				})
			}
		}
		mainFields = mainFields.slice(0,-1)
		compactLayoutFieldsForSobject[sobject]=mainFields
		console.log("m,="+mainFields)
		if (sendResponse)
			sendResponse({"mainFields": mainFields})
		else
			return mainFields
	}).catch(e=>{ _d(e); if (sendResponse) sendResponse({error: e.message}) })
}

/*
 Do a search for objects on SF.
 searchQuery would be an array of strings to perform the SOSL search

 parameters:
	 searchQuery - text query entered by user
		options - hash passed from caller with context information
		sendResponse - a callback from the main page
*/
const doSearch = (searchQuery,options,sendResponse,labelToNameFieldMapping,labelToSobjectApiNameMapping,compactLayoutFieldsForSobject) => {
	//clean and identift what is searched:  What is the Sobject and what is the query
	searchQuery = searchQuery.replace(/^\?\s*/,'')
	let searchQueryArray = searchQuery.split(/([^\s"]+|"[^"]*")+/g).filter(value => (value != ' ' && value != ''))
	let searchSobject=searchQueryArray[0]?.replaceAll('"','')
	let lc_searchSobject = searchSobject.toLowerCase()
	searchQueryArray.shift() //remove the sobject
	let searchText=searchQueryArray.join(" ").trim()
	if (searchText.startsWith('"') && searchText.endsWith('"'))
		searchText = searchText.slice(1, -1)
	//encode special characters:
	const specialChars = ['?', '&', '|', '!', '{', '}', '[', ']', '(', ')', '^', '~', '*', ':', '\\', '"', '\'', '+', '-']
	for (const char of specialChars) {
		const regex = new RegExp('\\' + char, 'g')
		searchText = searchText.replace(regex, '\\' + char)
	}
	//Which API field is the "Name" field of the record (account name, case number, product name, etc)
	const nameField = labelToNameFieldMapping[lc_searchSobject]
	if (!nameField) {
		console.table(labelToNameFieldMapping)
		sendResponse({ "error": "can't find field " + lc_searchSobject})
		return
	}
	const objectApiName = labelToSobjectApiNameMapping[lc_searchSobject]
	const lc_objectApiName = objectApiName.toLowerCase()
	let fieldsToReturn=""
	if (compactLayoutFieldsForSobject[lc_objectApiName]!=undefined) {
		fieldsToReturn=`(Id,${compactLayoutFieldsForSobject[lc_objectApiName]})`
	} else {
		console.log("compactLayoutFieldsForSobject is missing for "+lc_objectApiName+":",compactLayoutFieldsForSobject)
		fieldsToReturn=`(Id,${nameField})`
	}
	let SOQLQuery = `FIND {${searchText}} IN NAME FIELDS RETURNING ${objectApiName} ${fieldsToReturn} LIMIT 7`
	let url ="https://" + options.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/search/?q=' + encodeURI(SOQLQuery)
	forceNavigator.getHTTP(url,"json", {"Authorization": "Bearer " + options.sessionId, "Accept": "application/json"})
	.then(response => {
		console.info("doSearch Resposne:`n", response)
		if(response && response.error) { console.error("response", response, chrome.runtime.lastError); return }
		sendResponse({
			"searchRecords": response.searchRecords,
			"searchObject" : lc_searchSobject,
			"objectApiName" : objectApiName,
			"mainFields": compactLayoutFieldsForSobject[objectApiName]})
		return
	}).catch(e=>{ _d(e); sendResponse({error: e.message}) })
}

/*
 get details of an object (fields, page layouts, etc)
 sourceCommand == forceNavigator.commands[command] object
 options - hash passed from caller with context information
 sendResponse - a callback from the main page
*/
const getMoreData = (sourceCommand,options,sendResponse)=>{
	let apiname = sourceCommand.apiname
	let label = sourceCommand.label
	let key = sourceCommand.key
	//last element in the key indicates what to load
	let commandArray = key.split('.')
	let infoToGet = commandArray[commandArray.length-1]
	if (sourceCommand.detailsAlreadyLoaded) {
		sendResponse({ "info": "already loaded data for " + infoToGet })
		return
	}
	//Find the relevant query for this object, based on sfObjectsGetData
	let baseurl="https://" + options.apiUrl + '/services/data/' + forceNavigator.apiVersion
	let url = ""
	try {
		if (typeof sfObjectsGetData[infoToGet] != "undefined") {
			url = baseurl + sfObjectsGetData[infoToGet].getDataRequest(apiname)
		} else {
			sendResponse({ "info": "can't expand field " + infoToGet})
			return
		}
	} catch (e){
		_d(e)
	}
	forceNavigator.getHTTP(url,"json", {"Authorization": "Bearer " + options.sessionId, "Accept": "application/json"})
	.then(response => {
		if(response && response.error) { console.error("response", response, chrome.runtime.lastError); return }
		//use the "processResponse" for this object type, to generate the list of commands
		let objCommands= sfObjectsGetData[infoToGet].processResponse(apiname,label,response)
		Object.assign(metaData[options.sessionHash], objCommands)
		sendResponse(objCommands)
	}).catch(e=>{ _d(e); sendResponse({error: e.message}) })
}

const getOtherExtensionCommands = (otherExtension, requestDetails, settings = {}, sendResponse)=>{
	const url = requestDetails.domain.replace(/https*:\/\//, '')
	const apiUrl = requestDetails.apiUrl
	let commands = {}
	if(chrome.management) {
		chrome.management.get(otherExtension.id, response => {
			if(chrome.runtime.lastError) { _d("Extension not found", chrome.runtime.lastError); return }
			otherExtension.commands.forEach(c=>{
				commands[c.key] = {
					"url": otherExtension.platform + "://" + otherExtension.urlId + c.url.replace("$URL",url).replace("$APIURL",apiUrl),
					"label": t(c.key),
					"key": c.key
				}
			})
			sendResponse(commands)
		})
	}
}

const parseMetadata = (data, url, settings = {}, serverUrl)=>{
	console.log("parseMetadata data:", data)
	if (!data || typeof data.sobjects == "undefined") {
		console.warn("parseMetadata: invalid data", data)
		return false
	}
	const mapKeys = Object.keys(forceNavigator.objectSetupLabelsMap)
	let res = data.sobjects.reduce((commands, sObjectData) => forceNavigator.createSObjectCommands(commands, sObjectData, serverUrl), {})
	console.log("parseMetadata returning commands count:", Object.keys(res).length)
	return res
}

const goToUrl = (targetUrl, newTab, settings = {})=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		const re = new RegExp("\\w+-extension:\/\/"+chrome.runtime.id,"g")
		targetUrl = targetUrl.replace(re,'')
		
		let newUrl
		if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('chrome-extension://')) {
			newUrl = targetUrl
		} else {
			let relativeUrl = targetUrl.match(/.*?\.com(.*)/)
			relativeUrl = relativeUrl ? relativeUrl[1] : targetUrl
			if (!relativeUrl.startsWith('/')) {
				relativeUrl = '/' + relativeUrl
			}
			
			// Normalize domain prefix
			let currentOrigin = tabs[0].url.match(/https:\/\/.*?\.com|https:\/\/.*?\.salesforce-setup\.com|https:\/\/.*?\.force\.com/)[0]
			// Remove all domain suffixes to get just the org prefix (e.g., "homebound")
			let domainPrefix = currentOrigin.replace('https://', '')
				.replace('.my.salesforce-setup.com', '')
				.replace('.my.salesforce.com', '')
				.replace('.lightning.force.com', '')
				.replace('.salesforce-setup.com', '')
				.replace('.force.com', '')

			if (relativeUrl.startsWith('/lightning/setup/') || relativeUrl.startsWith('/lightning/setup/')) {
				newUrl = "https://" + domainPrefix + ".my.salesforce-setup.com" + relativeUrl
			} else {
				newUrl = "https://" + domainPrefix + ".lightning.force.com" + relativeUrl
			}
		}

		if (!newUrl.startsWith('http') && !newUrl.startsWith('chrome-extension')) {
			console.error("Invalid URL generated:", newUrl, "from targetUrl:", targetUrl)
			newUrl = "https://" + newUrl
		}

		if(newTab)
			chrome.tabs.create({ "active": false, "url": newUrl, "index" : (tabs[0].index+1) })
		else
			chrome.tabs.update(tabs[0].id, { "url": newUrl })
	})
}

chrome.commands.onCommand.addListener((command)=>{
	switch(command) {
		case 'showSearchBox': showElement("searchBox"); break
		case 'showAppMenu': showElement("appMenu"); break
		case 'goToTasks': goToUrl(".com/00T"); break
		case 'goToReports': goToUrl(".com/00O"); break
	}
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
	var apiUrlBase = request.serverUrl?.replace('.lightning.force.com', '.my.salesforce.com').replace('.salesforce-setup.com', '.my.salesforce.com').replace('.my.my.', '.my.')
	switch(request.action) {
		case "goToUrl":
			goToUrl(request.url, request.newTab, request.settings)
			sendResponse({})
			break
		case "getOtherExtensionCommands":
			getOtherExtensionCommands(request.otherExtension, request, request.settings, sendResponse)
			return true
		case "getApiSessionId":
			request.sid = request.uid = request.domain = request.oid = ""
			var serverUrl = request.serverUrl
			if (!serverUrl.startsWith('http')) serverUrl = "https://" + serverUrl
			var domainPrefix = serverUrl.replace('https://', '').split('.')[0]
			var apiHost = serverUrl.replace('https://', '').replace('.lightning.force.com', '.my.salesforce.com').replace('.salesforce-setup.com', '.my.salesforce.com').replace('.my.my.', '.my.')
			var apiUrl = "https://" + apiHost

			const processSession = (sid, domain) => {
				console.log("Processing session:", {sid: sid ? sid.substring(0, 10) + "..." : null, domain, apiUrl});
				if (!sid) {
					console.log("No session data found for " + serverUrl)
					sendResponse({error: "No session data found for " + serverUrl})
					return 
				}
				let oid = sid.match(/([\w\d]+)/)[1]
				forceNavigator.getHTTP( apiUrl + '/services/data/' + forceNavigator.apiVersion, "json",
					{"Authorization": "Bearer " + sid, "Accept": "application/json"}
				).then(response => {
					console.log("Identity check response:", response);
					if(response?.identity) {
						let uid = response.identity.match(/005.*/)[0]
						sendResponse({sessionId: sid, userId: uid, orgId: oid, apiUrl: apiHost})
					}
					else {
						console.error("No identity in response", response);
						sendResponse({error: "No user data found for " + oid + ". Response: " + JSON.stringify(response)})
					}
				}).catch(e => {
					console.error("Identity lookup failed", e)
					sendResponse({error: "Identity lookup failed: " + e.message})
				})
			}

			// Prioritize .my.salesforce.com cookie for API calls, then fall back
			chrome.cookies.get({url: apiUrl, name: "sid", storeId: sender.tab.cookieStoreId}, c => {
				if (c && c.value) {
					console.log("Found SID cookie for API URL:", apiUrl, "domain:", c.domain)
					processSession(c.value, c.domain)
				} else {
					// Fallback: search all cookies for a matching domain
					console.log("No direct cookie for", apiUrl, "- searching all cookies")
					chrome.cookies.getAll({}, (all)=>{
						let mySalesforceCookie = null
						let lightningCookie = null
						all.forEach((cookie)=>{
							if(cookie.name === "sid") {
								if (cookie.domain.includes(".my.salesforce.com") && cookie.domain.includes(domainPrefix)) {
									mySalesforceCookie = cookie
								} else if (cookie.domain.includes(domainPrefix)) {
									lightningCookie = cookie
								}
							}
						})
						let bestCookie = mySalesforceCookie || lightningCookie
						if (bestCookie) {
							console.log("Using fallback cookie from domain:", bestCookie.domain)
							processSession(bestCookie.value, bestCookie.domain)
						} else {
							console.log("No session cookie found for", domainPrefix)
							sendResponse({error: "No session cookie found for " + domainPrefix})
						}
					})
				}
			})
			return true
		case 'getMoreData':
			getMoreData(request.sourceCommand,request,sendResponse)
			return true
		case 'getActiveFlows':
			let flowCommands = {}
			forceNavigator.getHTTP("https://" + request.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/query/?q=select+ActiveVersionId,Label+from+FlowDefinitionView+where+IsActive=true', "json",
				{"Authorization": "Bearer " + request.sessionId, "Accept": "application/json"})
				.then(response => {
					let flowTargetUrl = request.domain + "/builder_platform_interaction/flowBuilder.app?flowId="
					response.records.forEach(f=>{
						flowCommands["flow." + f.ActiveVersionId] = {
							"key": "flow." + f.ActiveVersionId,
							"url": flowTargetUrl + f.ActiveVersionId,
							"label": [t("prefix.flows"), f.Label].join(" > ")
						}
					})
					sendResponse(flowCommands)
				}).catch(e=>{ _d(e); sendResponse({error: e.message}) })
			return true
		case 'getSobjectNameFields':
			let labelToSobjectApiNameMapping = {}
			let labelToNameFieldMapping = {}
			forceNavigator.getHTTP("https://" + request.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/query/?q=SELECT+QualifiedApiName,MasterLabel,EntityDefinition.QualifiedApiName,EntityDefinition.MasterLabel+FROM+FieldDefinition+WHERE+IsNameField=true+AND+EntityDefinition.IsCustomizable=true', "json",
				{"Authorization": "Bearer " + request.sessionId, "Accept": "application/json"})
				.then(response => {
					response.records.forEach(f=>{
						const nameField = f.QualifiedApiName
						const apiName = f.EntityDefinition.QualifiedApiName
						let objectLabel = f.EntityDefinition.MasterLabel.toLowerCase()
						if (labelToSobjectApiNameMapping[objectLabel]) {
							//Duplicate label. add the API Name to distibguish the two (for example, Calendar and CalendarView have the same label)
							objectLabel = objectLabel + "(" + apiName +")"
						}
						objectLabel = objectLabel.replace(/['\"]/g, "")
						labelToSobjectApiNameMapping[objectLabel]=apiName
						labelToNameFieldMapping[objectLabel]=nameField
					})
					sendResponse({"labelToNameFieldMapping":labelToNameFieldMapping,"labelToSobjectApiNameMapping":labelToSobjectApiNameMapping})
				}).catch(e=>{ _d(e); sendResponse({error: e.message}) })
			return true
		case 'getMetadata':
			let cacheKey = request.sessionHash || request.apiUrl
			if(metaData[cacheKey] == null || request.force)
				forceNavigator.getHTTP("https://" + request.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/sobjects/', "json",
					{"Authorization": "Bearer " + request.sessionId, "Accept": "application/json"})
					.then(response => {
						let parsed = parseMetadata(response, request.domain, request.settings, request.serverUrl)
						if (parsed) {
							metaData[cacheKey] = parsed
							sendResponse(metaData[cacheKey])
						} else {
							sendResponse({error: "Failed to parse metadata"})
						}
					}).catch(e=>{ _d(e); sendResponse({error: e.message}) })
			else
				sendResponse(metaData[cacheKey])
			return true
		case 'doSearch':
			doSearch(request.searchQuery, request, sendResponse,request.labelToNameFieldMapping,request.labelToSobjectApiNameMapping,request.compactLayoutFieldsForSobject)
			return true
		case 'loadCompactLayoutForSobject':
			loadCompactLayoutForSobject(request.sobject, request, request.compactLayoutFieldsForSobject, sendResponse)
			return true
		case 'createTask':
			forceNavigator.getHTTP("https://" + request.apiUrl + "/services/data/" + forceNavigator.apiVersion + "/sobjects/Task",
				"json", {"Authorization": "Bearer " + request.sessionId, "Content-Type": "application/json" },
				{"Subject": request.subject, "OwnerId": request.userId}, "POST")
			.then(function (response) { sendResponse(response) }).catch(e=>{ _d(e); sendResponse({error: e.message}) })
			return true
		case 'searchLogins':
			forceNavigator.getHTTP("https://" + request.apiUrl + "/services/data/" + forceNavigator.apiVersion + "/query/?q=SELECT Id, Name, Username FROM User WHERE Name LIKE '%25" + request.searchValue.trim() + "%25' OR Username LIKE '%25" + request.searchValue.trim() + "%25'", "json", {"Authorization": "Bearer " + request.sessionId, "Content-Type": "application/json" })
			.then(function(success) { sendResponse(success) }).catch(function(error) {
				sendResponse({error: error.message})
			})
			return true
		case 'help':
			chrome.tabs.create({url: chrome.extension.getURL('popup.html')})
			sendResponse({})
			break
		case 'updateLastCommand':
			if (request.key == undefined || request.url == undefined) {
				sendResponse({})
				break
			}
			if (commandsHistory[ request.orgId ] == undefined)
				commandsHistory[ request.orgId ] = []
			var command=[ request.key, request.url ]
			//if already exists in history, move it to top
			for (var i=commandsHistory[ request.orgId ].length - 1; i>=0; i--) {
				if (commandsHistory[ request.orgId ][i][0] == request.key) {
					commandsHistory[ request.orgId ].splice( i, 1)
					break
				}
			}
			commandsHistory[ request.orgId ].push(command)
			if (commandsHistory[ request.orgId ].length > 8) {
				commandsHistory[ request.orgId ].shift()
			}
			sendResponse({})
			break
		case 'getCommandsHistory':
			sendResponse({ "commandsHistory": commandsHistory[ request.orgId ] })
			break
		default:
			// Unknown action - respond immediately to prevent channel closure warning
			sendResponse({})
			break
	}
	return true
})