(function (document) {
	"use strict";

	var widgetData = new function () {
		this.urlStart = null;
		this.alias = null;
		this.baseUrl = null;
	}

	init();

	window.onmessage = function(event)
	{
		if (event.data.indexOf("widget-booking-data") >= 0 || event.data.indexOf("la-login-widget-dashboard")>=0) {
			window.location = event.data;
		}
		else if (event.data.indexOf("get-parent-website-protocol") >= 0)
		{
			var message = {
				event_id: "parent-website-protocol",
				data: location.protocol
			}
			event.source.postMessage(message, "*");
		}
	};

	//----------------------------

	function init() {
		var i;
		var link;
		var pageLinks = document.getElementsByTagName("a");
		for (i = 0; i < pageLinks.length; i++) {
			// Find appropriate element which contains data for widget initialization
			link = pageLinks[i];
			if (link.getAttribute("data-ores-widget")) {
				var widgetType = link.dataset.oresWidget;
				if (typeof widgetType != "undefined") {
					initWidget(widgetType, link);
				}
			}
		}
	}

	function initWidget(widgetType, link) {
		// Initialize different kinds of widgets
		setWidgetData(link);

		// Do necessary fixes if run from safari iframe
		checkForSafariIFrameFix();

		var iframeUrl = widgetData.baseUrl;

		if (widgetType === "website") {
			if (window.location.href.indexOf("widget-booking-data") >= 0) {
				iframeUrl += "/Booking/Index?bookingData=" + window.location.href.toString().split("widget-booking-data=")[1];
			}
			else if (window.location.href.indexOf("la-login-widget-forget-password") >= 0) {
				iframeUrl += "/Account/ForgotPassword";
			}
			else if (window.location.href.indexOf("la-login-widget-register") >= 0) {
				iframeUrl += "/Account/Registration";
			}
			else if (window.location.href.indexOf("la-login-widget-dashboard") >= 0) {
				iframeUrl += "/Dashboard/Index";
			}
		}
		else if (widgetType === "quickres") {
			iframeUrl += "/widget/quickReservation?redirectUrl=" + link.dataset.redirectUrl;
		}
		else if (widgetType === "login") {
			iframeUrl += "/Widget/Login?redirectUrl=" + link.dataset.redirectUrl;
		}

		initIframePage(link, iframeUrl);
	}

	function initIframePage(link, iframeLink) {

		var s1 = loadIframeResizeScript(link);

		//add iframe
		var iframe = iframeBuild(iframeLink);
		insertNodeAfter(iframe, s1);

		// remove link
		link.parentNode.removeChild(link);
	}

	function iframeBuild(src) {
		//TODO: think about documentFragment for this code;
		var iframe = document.createElement('iframe');
		iframe.setAttribute('src', src);
		iframe.setAttribute('width', "100%");
		iframe.setAttribute('tabindex', "0");
		iframe.setAttribute('frameborder', "0");
		iframe.setAttribute('scrolling', "no");
		iframe.setAttribute('allowtransparency', "true");
		iframe.setAttribute('horizontalscrolling', "no");
		iframe.setAttribute('verticalscrolling', "no");
		iframe.setAttribute('allow', 'geolocation');
		iframe.setAttribute('class', 'ores4iframe');
		iframe.style.minWidth = "100%";
		// Subscribe for onload event to start fixing height of iframe
		iframe.onload = iframeLoaded;

		return iframe;
	}

	function loadIframeResizeScript(link) {
		var s1 = document.createElement('script');
		s1.setAttribute('src', widgetData.urlStart + "/Scripts/iframeResizer/iframeResizer.min.js");
		s1.type = "text/javascript";
		insertNodeAfter(s1, link);
		return s1;
	}

	function setWidgetData(link) {
		widgetData.alias = link.dataset.oresAlias;

		var urlStartIndex = link.href.indexOf(widgetData.alias);

		if (urlStartIndex !== -1) {
			widgetData.urlStart = link.href.substring(0, urlStartIndex - 1);
			widgetData.baseUrl = widgetData.urlStart + "/" + widgetData.alias;
		}
		else if (console) {
			console.error("Error in Ores widget initialization");
		}
	}

	function insertNodeAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	function iframeLoaded() {

		var isOldIE = (navigator.userAgent.indexOf("MSIE") !== -1); // Detect IE10 and below

		//TODO: try to move resizer inside iframe to head of iframe document. Maybe it will speed up fixing of height.
		iFrameResize({
				checkOrigin: false,
				heightCalculationMethod: isOldIE ? 'max' : 'lowestElement'
			},
			'.ores4iframe');

		// The lowestElement option is the most reliable way of determining the page height. However, it does have a performance impact in older versions of IE.
		// In one screen refresh (16ms) Chrome can calculate the position of around 10,000 html nodes, whereas IE 8 can calculate approximately 50.
		// The taggedElement option provides much greater performance by limiting the number of elements that need their position checked. https://github.com/davidjbradshaw/iframe-resizer#heightcalculationmethod
		// Was used lowestElement cause of bug with datepicker (ORF-915)
	}

	//---------------------------------------
	// Helper functions to safari iframe cookie fix
	//---------------------------------------

	function checkForSafariIFrameFix() {
		// https://stackoverflow.com/a/7768006/421891
		var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		if (isSafari) {
			var cookieName = "safari_fix_applied";
			var cookieFix = getCookie(cookieName);
			if (cookieFix === null) {
				setCookie(cookieName, new Date().toISOString());
				window.location.href = widgetData.urlStart + "/Widgets/_safari_fix.html";
			}
		}
	}

	function getCookie(name) {
		var cookiesArr = document.cookie.split(";");
		for (var i = 0; i < cookiesArr.length; i++) {
			var cItem = cookiesArr[i].split("=");
			if (cItem.length > 0) {
				var cookieName = cItem[0].replace(/^\s+|\s+$/g, ''); //trim
				if (cookieName === name) {
					return {
						name: cookieName,
						value: cItem[1]
					};
				}
			}
		}

		return null;
	}

	function setCookie(name, value) {
		var d = new Date();
		var year = d.getFullYear();
		var month = d.getMonth();
		var day = d.getDate();
		var expDate = new Date(year + 10, month, day); // +10 years

		var cookieValue = typeof value !== "undefined" ? value : "";
		cookieValue += ";expires=" + expDate.toGMTString() + ";path=/";
		document.cookie = name + "=" + cookieValue;
	}

})(document)
