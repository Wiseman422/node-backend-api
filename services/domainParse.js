import urlParser from "url";

export default class DomainParse {
  constructor() {
  }

  _removeWWWheaders(url) {
    let regexpHeader=/https?:\/\/(.*)/;
    let regexpArray=[/www\.(.*)/,/ww1\.(.*)/,/ww2\.(.*)/];

    let newUrl = url;
    let matches = regexpHeader.exec(url);

    if (matches){
      newUrl = matches[1];
    }

    regexpArray.forEach((regexp)=>{
      matches = regexp.exec(newUrl);
      if (matches){
        newUrl = matches[1];
      }  
    });
    return newUrl;

  }

  parse(url) 
  {
    if (url.indexOf("http") === -1) {
      url = "http://" + url;
    } 

    let hostname = urlParser.parse(url).hostname;

    return this._removeWWWheaders(hostname);
  }
}
