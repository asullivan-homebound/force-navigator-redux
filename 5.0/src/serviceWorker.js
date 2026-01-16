import { forceNavigator, forceNavigatorSettings, _d } from "./shared"
import { t } from "lisan"

const metaData = {}
let commandsHistory = {}

const showElement = (element)=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		switch(element) {
			case "appMenu":
				chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: ()=>{
					document.getElementsByClassName("appLauncher")[0].getElementsByTagName("button")[0].click()
				}})
				break
			case "searchBox":
				chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, func: ()=>{
					if(document.getElementById("sfnavSearchBox")) {
						document.getElementById("sfnavSearchBox").style.zIndex = 9999
						document.getElementById("sfnavSearchBox").style.opacity = 0.98
						document.getElementById("sfnavQuickSearch").focus()
					}
				}})
				break
		}
	})
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

const parseMetadata = (data, url, settings = {}, serverUrl, durableIdMap = {})=>{
	console.log("parseMetadata data:", data)
	if (!data || typeof data.sobjects == "undefined") {
		console.warn("parseMetadata: invalid data", data)
		return false
	}
	let mapKeys = Object.keys(forceNavigator.objectSetupLabelsMap)
	let res = data.sobjects.reduce((commands, sObjectData) => forceNavigator.createSObjectCommands(commands, sObjectData, serverUrl, durableIdMap), {})
	console.log("parseMetadata returning commands count:", Object.keys(res).length)
	return res
}

const goToUrl = (targetUrl, newTab, settings = {})=>{
	chrome.tabs.query({currentWindow: true, active: true}, (tabs)=>{
		const re = new RegExp("\\w+-extension:\\/\\/"+chrome.runtime.id,"g");
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
			
			// Use regex to capture the full domain prefix and sandbox segment.
			const domainMatch = tabs[0].url.match(/https:\/\/(.+?)\.(sandbox\.)?(lightning\.force\.com|my\.salesforce\.com|my\.salesforce-setup\.com|salesforce\.com|cloudforce\.com|visual\.force\.com)/)
			let domainPrefix = domainMatch ? domainMatch[1] : tabs[0].url.replace('https://', '').split('.')[0]
			const isSandbox = domainMatch && domainMatch[2] === 'sandbox.'

			if (relativeUrl.startsWith('/lightning/setup/')) {
				newUrl = "https://" + domainPrefix + (isSandbox ? ".sandbox" : "") + ".my.salesforce-setup.com" + relativeUrl
			} else {
				newUrl = "https://" + domainPrefix + (isSandbox ? ".sandbox" : "") + ".lightning.force.com" + relativeUrl
			}
		}

		if (!newUrl.startsWith('http') && !newUrl.startsWith('chrome-extension')) {
			console.error("Invalid URL generated:", newUrl, "from targetUrl:", targetUrl)
			newUrl = "https://" + newUrl
		}

		if(newTab)
			chrome.tabs.create({ "active": false, "url": newUrl })
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
	console.debug(apiUrlBase + " : " + request.action)
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
			// Use regex to correctly identify domain prefix and sandbox segment.
			const sessionDomainMatch = serverUrl.match(/https:\/\/(.+?)\.(sandbox\.)?(lightning\.force\.com|my\.salesforce\.com|my\.salesforce-setup\.com|salesforce\.com|cloudforce\.com|visual\.force\.com)/)
			var domainPrefix = sessionDomainMatch ? sessionDomainMatch[1] : serverUrl.replace('https://', '').split('.')[0]
			const sessionIsSandbox = sessionDomainMatch && sessionDomainMatch[2] === 'sandbox.'
			var apiHost = domainPrefix + (sessionIsSandbox ? ".sandbox" : "") + ".my.salesforce.com"
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
		case 'getActiveFlows':
			let flowCommands = {}
			forceNavigator.getHTTP("https://" + request.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/query/?q=select+ActiveVersionId,Label+from+FlowDefinitionView+where+IsActive=true', "json",
				{"Authorization": "Bearer " + request.sessionId, "Accept": "application/json"})
				.then(response => {
					let flowTargetUrl = "https://" + request.domain + "/builder_platform_interaction/flowBuilder.app?flowId="
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
		case 'getMetadata':
			let cacheKey = request.sessionHash || request.apiUrl
			if(metaData[cacheKey] == null || request.force)
				forceNavigator.getHTTP("https://" + request.apiUrl + '/services/data/' + forceNavigator.apiVersion + '/sobjects/', "json",
					{"Authorization": "Bearer " + request.sessionId, "Accept": "application/json"})
					.then(async response => {
						const customObjects = response.sobjects.filter(s => s.name.endsWith("__c"))
						const durableIdMap = {}
						if (customObjects.length > 0) {
							const batchSize = 100
							for (let i = 0; i < customObjects.length; i += batchSize) {
								const batch = customObjects.slice(i, i + batchSize)
								const devNames = batch.map(s => `'${s.name.replace(/__c$/, "")}'`).join(",")
								const query = `SELECT Id, DeveloperName FROM CustomObject WHERE DeveloperName IN (${devNames})`
								const toolingUrl = `https://${request.apiUrl}/services/data/${forceNavigator.apiVersion}/tooling/query/?q=${encodeURIComponent(query)}`
								try {
									const toolingResponse = await forceNavigator.getHTTP(toolingUrl, "json", {"Authorization": "Bearer " + request.sessionId, "Accept": "application/json"})
									if (toolingResponse && toolingResponse.records) {
										toolingResponse.records.forEach(r => {
											durableIdMap[r.DeveloperName + "__c"] = r.Id
										})
									}
								} catch (e) {
									console.error("Tooling API query failed", e)
								}
							}
						}
						let parsed = parseMetadata(response, request.domain, request.settings, request.serverUrl, durableIdMap)
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
		case 'createTask':
			forceNavigator.getHTTP("https://" + request.apiUrl + "/services/data/" + forceNavigator.apiVersion + "/sobjects/Task",
				"json", {"Authorization": "Bearer " + request.sessionId, "Content-Type": "application/json" },
				{"Subject": request.subject, "OwnerId": request.userId}, "POST")
			.then(function (response) { sendResponse(response) }).catch(e => { _d(e); sendResponse({error: e.message}) })
			return true
		case 'searchLogins':
			forceNavigator.getHTTP("https://" + request.apiUrl + "/services/data/" + forceNavigator.apiVersion + "/query/?q=SELECT Id, Name, Username FROM User WHERE Name LIKE '%25" + request.searchValue.trim() + "%25' OR Username LIKE '%25" + request.searchValue.trim() + "%25'", "json", {"Authorization": "Bearer " + request.sessionId, "Content-Type": "application/json" })
			.then(function(success) { sendResponse(success) }).catch(function(error) {
				sendResponse({error: error.message})
			})
			return true
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