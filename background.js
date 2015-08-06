/*
 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 */


/*chrome.extension.onMessageExternal.addListener(function (request, sender, sendResponse) {
	if ( request === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke" ) {
		chrome.extension.sendMessage(
			sender.id, {
				head: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback",
				body: info,
			});
	}
});
*/

// Context Menu Search

chrome.contextMenus.create({
	title: "Search \"%s\" on Fangraphs",
	contexts: ["selection"],
	onclick: function searchText(info){
		var url = encodeURI("http://" + "www.fangraphs.com/players.aspx?lastname=" + info.selectionText);
		chrome.tabs.create({url: url});
	}
});

// Omnibox Search
// Derived from OmniWiki (github.com/hamczu/OmniWiki)

var currentRequest = null;
var firstResult = '';

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {

	if (currentRequest != null) {
		currentRequest.onreadystatechange = null;
		currentRequest.abort();
		currentRequest = null;
	}

	if(text.length > 0){
		currentRequest = suggests(text, function(data) {
			var results = [];
			console.log('data.length = ' + data.length);
			console.log('lastFirstResult = ' + firstResult);
			if (data[0] == firstResult) {
				console.log('data[0] == lastFirstResult');
			}
			firstResult = data[0];
			if (data.length < 5) {
				num = data.length;
			} else {
				num = 5;
			}
			updateDefaultSuggestion(data[0]);
			for (var i = 1; i < num; i++) {
				console.log('data[' + i + '] = ' +data[i]);
				results.push({
					content: data[i],
					description: data[i]
				});
			}

			suggest(results);
		});
	} else {
	}

});

function resetDefaultSuggestion() {
	chrome.omnibox.setDefaultSuggestion({
		description: ' '
	});
};

resetDefaultSuggestion();

var searchLabel = chrome.i18n.getMessage('search_label');

function updateDefaultSuggestion(text) {
	chrome.omnibox.setDefaultSuggestion({
		description: text//searchLabel + 'Search on Fangraphs: %s'
	});

};

chrome.omnibox.onInputStarted.addListener(function() {
	updateDefaultSuggestion('');
});

chrome.omnibox.onInputCancelled.addListener(function() {
	resetDefaultSuggestion();
});


function suggests(query, callback) {
	var req = new XMLHttpRequest();

	req.open("GET","http://www.fangraphs.com/quickplayersearch.aspx?name=" + query, true);
	req.onload = function(){
		if(this.status == 200){
			try{
				var page = document.createElement( 'html' );
				page.innerHTML = this.responseText;
				var minorMajor = page.getElementsByClassName('search');
				var names = [];
				var i;
				for(i = 0; i < minorMajor.length; i++){
					var links = minorMajor[i].getElementsByTagName('a');
					for (index = 0; index < links.length; index++){
						names.push(links[index].childNodes[0].textContent);
					}
				}

				//var links = page.getElementsByTagName('a');


				callback(names);

			}catch(e){
				this.onerror();
			}
		}else{
			this.onerror();
		}
	};
	req.onerror = function(){

	};
	req.send();
};

//On Enter press, goes to fangraphs site
chrome.omnibox.onInputEntered.addListener(function(text) {
	if (text == "settings") {
		chrome.tabs.update(null, {url: chrome.extension.getURL('settings.html')});
	} else {
		chrome.tabs.update(null, {url: "http://" + "www.fangraphs.com/players.aspx?lastname=" + text});
	}
});

 /*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "getLocalStorage")
		sendResponse({data: localStorage[request.key]});
	else
		sendResponse({}); // snub them.
});
	*/