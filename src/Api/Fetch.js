/**
 * Original cross-browser API access
 */

export default class Fetch{

  static defaults = {
    base_url: '',
    url     : '?no_cache=123',
    data    : {

    },
    method  : 'POST'
  };

  constructor( /* Request params: url, method, data */ ){
    let params = Fetch.checkDefaults( arguments );
    return new Promise( function( resolve, reject ){
      let XHR = new XMLHttpRequest();
      XHR.onreadystatechange = function() {
        if( XHR.readyState === 4 ) {
            if( XHR.status === 200 ) {
                resolve( ( XHR.responseText.indexOf( '{' ) >= 0 ) ? JSON.parse( XHR.responseText ) : XHR.responseText );
            } else {
                reject( "[API ERROR] There was a problem in fetching API data!" );
            }
        }
      };
      XHR.open( params.method, params.url, true );
      XHR.setRequestHeader( "Content-Type", "application/json" );
      XHR.send( JSON.stringify( params.data ) );
    } );
  }

  static checkDefaults( params ){
    return {
      url     : this.defaults.base_url + ( params[0] || this.defaults.url ),
      method  : params[1] || this.defaults.method,
      data    : params[2] || this.defaults.data
    }
  }

}