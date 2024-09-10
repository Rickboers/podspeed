(()=>{"use strict";const e=/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,t="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)",o=/<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;class n extends Error{constructor(e){super(`[YoutubeTranscript] 🚨 ${e}`)}}class a extends n{constructor(){super("YouTube is receiving too many requests from this IP and now requires solving a captcha to continue")}}class s extends n{constructor(e){super(`The video is no longer available (${e})`)}}class i extends n{constructor(e){super(`Transcript is disabled on this video (${e})`)}}class c extends n{constructor(e){super(`No transcripts are available for this video (${e})`)}}class l extends n{constructor(e,t,o){super(`No transcripts are available in ${e} this video (${o}). Available languages: ${t.join(", ")}`)}}class r{static fetchTranscript(e,n){var r,u,d,g,p;return u=this,d=void 0,p=function*(){const u=this.retrieveVideoId(e),d=yield fetch(`https://www.youtube.com/watch?v=${u}`,{headers:Object.assign(Object.assign({},(null==n?void 0:n.lang)&&{"Accept-Language":n.lang}),{"User-Agent":t})}),g=yield d.text(),p=g.split('"captions":');if(p.length<=1){if(g.includes('class="g-recaptcha"'))throw new a;if(!g.includes('"playabilityStatus":'))throw new s(e);throw new i(e)}const f=null===(r=(()=>{try{return JSON.parse(p[1].split(',"videoDetails')[0].replace("\n",""))}catch(e){return}})())||void 0===r?void 0:r.playerCaptionsTracklistRenderer;if(!f)throw new i(e);if(!("captionTracks"in f))throw new c(e);if((null==n?void 0:n.lang)&&!f.captionTracks.some((e=>e.languageCode===(null==n?void 0:n.lang))))throw new l(null==n?void 0:n.lang,f.captionTracks.map((e=>e.languageCode)),e);const h=((null==n?void 0:n.lang)?f.captionTracks.find((e=>e.languageCode===(null==n?void 0:n.lang))):f.captionTracks[0]).baseUrl,v=yield fetch(h,{headers:Object.assign(Object.assign({},(null==n?void 0:n.lang)&&{"Accept-Language":n.lang}),{"User-Agent":t})});if(!v.ok)throw new c(e);return[...(yield v.text()).matchAll(o)].map((e=>{var t;return{text:e[3],duration:parseFloat(e[2]),offset:parseFloat(e[1]),lang:null!==(t=null==n?void 0:n.lang)&&void 0!==t?t:f.captionTracks[0].languageCode}}))},new((g=void 0)||(g=Promise))((function(e,t){function o(e){try{a(p.next(e))}catch(e){t(e)}}function n(e){try{a(p.throw(e))}catch(e){t(e)}}function a(t){var a;t.done?e(t.value):(a=t.value,a instanceof g?a:new g((function(e){e(a)}))).then(o,n)}a((p=p.apply(u,d||[])).next())}))}static retrieveVideoId(t){if(11===t.length)return t;const o=t.match(e);if(o&&o.length)return o[1];throw new n("Impossible to retrieve Youtube video ID.")}}let u=0,d=[],g=-1,p=!0,f=null,h=3;function v(){const e=document.querySelector("video");if(e){function t(t){t=Math.round(4*t)/4,t=Math.max(.75,Math.min(t,2));const o=e.playbackRate,n=(t-o)/4;!function a(s){if(s<=4){const t=o+n*s;e.playbackRate=t,console.log(`Speed changed to ${t.toFixed(2)}x. Step ${s}/4`),setTimeout((()=>a(s+1)),500)}else u++,console.log(`Speed change complete. New speed: ${t.toFixed(2)}x. Total changes: ${u}`)}(1)}function o(){const e=new URLSearchParams(window.location.search).get("v");e?r.fetchTranscript(e).then((e=>{d=e,console.log("Transcript fetched successfully")})).catch((e=>console.log("Error fetching transcript:",e))):console.log("Could not find video ID")}function n(){if(!p)return;const o=e.currentTime;let n=d.findIndex((e=>o<e.offset));if(-1!==n&&n>g){const e=[];for(;e.length<6&&n<d.length;){const t=d[n],o=t.text.split(/\s+/).length;o>=4?e.push(t):console.log(`Skipped segment: "${t.text}" (${o} words)`),n++}if(6===e.length){const o=e[5].offset+e[5].duration-e[0].offset,a=e.reduce(((e,t)=>e+t.text.split(/\s+/).length),0)/o,s=h/a;t(s),console.log(`Upcoming 6 segments at ${e[0].offset.toFixed(2)}s:`),e.forEach((e=>{console.log(`  Offset: ${e.offset.toFixed(2)}s, Text: "${e.text}"`)})),console.log(`Total Words/Second: ${a.toFixed(2)}, Target Speed: ${s.toFixed(2)}x`),g=n-1}}}setTimeout(o,2e3),f=setInterval(n,100),console.log("YouTube Speed Controller and Transcript Analyzer active")}else console.log("No video found on this page")}chrome.runtime.onMessage.addListener((function(e,t,o){"update"===e.action&&(p=e.isEnabled,h=e.targetWPS,p?(f||v(),console.log(`YouTube Speed Controller activated with target WPS: ${h}`)):function(){f&&(clearInterval(f),f=null);const e=document.querySelector("video");e&&(e.playbackRate=1),console.log("YouTube Speed Controller deactivated")}())})),chrome.storage.sync.get(["isEnabled","targetWPS"],(function(e){p=!1!==e.isEnabled,h=e.targetWPS||3,p&&v()})),"complete"===document.readyState?p&&v():window.addEventListener("load",(function(){p&&v()}))})();