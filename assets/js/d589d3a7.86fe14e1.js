"use strict";(self.webpackChunkergogen_docs=self.webpackChunkergogen_docs||[]).push([[162],{3905:function(e,t,n){n.d(t,{Zo:function(){return u},kt:function(){return g}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=p(n),g=o,m=d["".concat(s,".").concat(g)]||d[g]||c[g]||a;return n?r.createElement(m,i(i({ref:t},u),{},{components:n})):r.createElement(m,i({ref:t},u))}));function g(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,i=new Array(a);i[0]=d;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l.mdxType="string"==typeof e?e:o,i[1]=l;for(var p=2;p<a;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},9390:function(e,t,n){n.r(t),n.d(t,{frontMatter:function(){return l},contentTitle:function(){return s},metadata:function(){return p},toc:function(){return u},default:function(){return d}});var r=n(7462),o=n(3366),a=(n(7294),n(3905)),i=["components"],l={id:"getting-started",sidebar_label:"Getting started",sidebar_position:0,slug:"/"},s="Getting Started",p={unversionedId:"getting-started",id:"getting-started",isDocsHomePage:!1,title:"Getting Started",description:'Until there\'s a proper "Getting started" guide, try getting acquainted with ergogen by following these steps in order:',source:"@site/docs/getting-started.md",sourceDirName:".",slug:"/",permalink:"/",editUrl:"https://github.com/ergogen/ergogen-docs/edit/main/website/docs/getting-started.md",tags:[],version:"current",sidebarPosition:0,frontMatter:{id:"getting-started",sidebar_label:"Getting started",sidebar_position:0,slug:"/"},sidebar:"tutorialSidebar",next:{title:"Config overview",permalink:"/config-overview"}},u=[{value:"Command line usage",id:"command-line-usage",children:[]},{value:"Development usage",id:"development-usage",children:[]}],c={toc:u};function d(e){var t=e.components,n=(0,o.Z)(e,i);return(0,a.kt)("wrapper",(0,r.Z)({},c,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"getting-started"},"Getting Started"),(0,a.kt)("p",null,'Until there\'s a proper "Getting started" guide, try getting acquainted with ergogen by following these steps in order:'),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Read the ",(0,a.kt)("a",{parentName:"p",href:"https://docs.ergogen.xyz"},"docs"),". D'uuh. They're not complete by any measure, but should give you a fairly good idea what you're dealing with here.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Try one of the web-based deployments (",(0,a.kt)("a",{parentName:"p",href:"https://ergogen.xyz"},"official"),"; ",(0,a.kt)("a",{parentName:"p",href:"https://ergogen.cache.works/"},"unofficial")," but probably better and soon to be official) - no need to download the CLI unless you want to A) preview in-development features, B) use custom modifications, or C) contribute code. Click things, look at outputs; see if things start to make sense.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"Search the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/topics/ergogen"},(0,a.kt)("inlineCode",{parentName:"a"},"#ergogen"))," topic on GitHub to look at (and reverse engineer) a variety of real life configs using ergogen. Pop them into the web UI, see what they do, tinker with them; things should start to make more and more sense.")),(0,a.kt)("li",{parentName:"ol"},(0,a.kt)("p",{parentName:"li"},"If a question persists after all of the above, feel free to ask it over on ",(0,a.kt)("a",{parentName:"p",href:"https://discord.gg/nbKcAZB"},"Discord")," and we'll do our best to help you out."))),(0,a.kt)("h2",{id:"command-line-usage"},"Command line usage"),(0,a.kt)("div",{className:"admonition admonition-info alert alert--info"},(0,a.kt)("div",{parentName:"div",className:"admonition-heading"},(0,a.kt)("h5",{parentName:"div"},(0,a.kt)("span",{parentName:"h5",className:"admonition-icon"},(0,a.kt)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"14",height:"16",viewBox:"0 0 14 16"},(0,a.kt)("path",{parentName:"svg",fillRule:"evenodd",d:"M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"}))),"info")),(0,a.kt)("div",{parentName:"div",className:"admonition-content"},(0,a.kt)("p",{parentName:"div"},"Requires node v14.4.0+ with npm v6.14.5+ to be installed."))),(0,a.kt)("p",null,"If command line is more your thing, you can install the latest ergogen release by issuing:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"npm i -g ergogen\n")),(0,a.kt)("p",null,"After this, you will be able to use the ",(0,a.kt)("inlineCode",{parentName:"p"},"ergogen")," command - for example, by specifying an input config and an output folder like so:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"ergogen input.yaml -o output_folder\n")),(0,a.kt)("p",null,"For the full set command line options available, see ",(0,a.kt)("inlineCode",{parentName:"p"},"ergogen --help"),"."),(0,a.kt)("h2",{id:"development-usage"},"Development usage"),(0,a.kt)("p",null,"If you want to sneak a peek of the features being developed on the cutting edge, or would like to contribute stuff, you can clone the repo locally by:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"git clone https://github.com/ergogen/ergogen.git\ncd ergogen\nnpm install\n")),(0,a.kt)("p",null,"To use this local copy, you would call ",(0,a.kt)("inlineCode",{parentName:"p"},"node src/cli.js")," instead of the global ",(0,a.kt)("inlineCode",{parentName:"p"},"ergogen")," command.\nSo the above example would change to:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"node src/cli.js input.yaml -o output_folder\n")))}d.isMDXComponent=!0}}]);