import React from 'react'
import loading from '../loading.svg'
import Pair from "./Pair";
import Fetch from "../Api/Fetch";

class Parser extends React.Component {
    constructor(props){
        super(props);
        this.state = this.defaults = {
            data:[],
            parsed: false,
            file: this.props.file,
            text: '',
            header: '',
            pairs: [],
            pasted: '',
            lang: '',
            source: '',
            changed: false
        };
        this.changed = this.changed.bind(this);
        this.parse = this.parse.bind(this);
        this.pasted = this.pasted.bind(this);
        this.showPasted = this.showPasted.bind(this);
        this.parsePasted = this.parsePasted.bind(this);
        this.loadFile = this.loadFile.bind(this);
        this.onFileLoaded = this.onFileLoaded.bind(this);
        this.download = this.download.bind(this);
        this.translate = this.translate.bind(this);
    }
    
    componentDidMount(){
        setTimeout( this.loadFile, 300 );
    }
    
    onFileLoaded( evt ) {
        if ( evt.target.readyState === FileReader.DONE )
            this.parse( evt.target.result );
    }
    
    loadFile(){
        let { file } = this.state;
        let reader = new FileReader();
        reader.onloadend = this.onFileLoaded;
        reader.readAsText( file );
    }
    
    changed( _data ){
        let { data } = this.state;
        data[ _data.id ].translate = _data.translate;
        this.setState({
            data: data,
            changed: true
        })
    }
    
    clearInput( text ){
        let r = [],
            t = { id: '', translate: '', plural: false },
            tp = { id: '', translate: '', plural: true },
            m = false, l = '', o = '', lines = text.split('\n');
        for( const line of lines ){
            o = line.trimLeft();
            if( o.charAt(0) === '#' || o.indexOf('msgctxt') >= 0 ) continue;
            l = this.format( o );
            if( o.indexOf( 'msgid ' ) === 0 ) {
                if( t.id ) r.push( t );
                if( tp.id ) r.push( tp );
                m = 1;
                t  = { id: '', translate: '', plural: false };
                tp = { id: '', translate: '', plural: true }
            } else if( o.indexOf( 'msgid_plural ' ) === 0 ) {
                m = 2;
            } else if( o.indexOf( 'msgstr ' ) === 0 || o.indexOf( 'msgstr[0] ' ) === 0 ) {
                m = 0;
            } else if( o.indexOf( 'msgstr[' ) === 0 ) {
                m = 3;
            }
            switch( m ){
                case 1  : t.id += l;            break;
                case 2  : tp.id += l;           break;
                case 3  : tp.translate += l;    break;
                default : t.translate += l;
            }
        }
        return r;
    }
    
    extractHeader( text ){
        let from = text.indexOf( "msgstr \"\"\n" ) + 10;
        let to = text.indexOf( "\n\n" ) - from;
        return text.substr( from, to );
    }
    
    parse( text ){
        let header = this.extractHeader( text );
        let pl = header.indexOf( 'Language: ' );
        let lng = ( pl > 0 ? header.substr( pl + 10, 2 ) : 'sv' );
        let data = this.clearInput( text );
        let t = '',
            p = '',
            pairs = [];
        let ts = Date.now() + Math.random() * 10000;
        for( let i = 0; i < data.length; i++ ){
            t += data[i].id + "\n";
            p += data[i].translate + "\n";
            pairs.push( <Pair id={data[i].id} translate={data[i].translate} index={i} key={"x-pair-" + ts + "-" + i} onChange={this.changed} /> );
        }
        this.setState( { data: data, parsed: true, header: header, text: t, pairs: pairs, pasted: p, source: 'en', lang: lng } );
    }
    
    translate(){
        this.setState( { parsed: false } );
        let { lang, text, source  } = this.state;
        new Fetch( '?', 'POST', {
            translate_x_data: {
                from: source,
                to: lang,
                text: text
            }
        } )
          .then( data => {
              if( data.error )
                  return alert( data.error );
              if( data.translated )
                  this.parsePasted( data.translated );
          } )
          .catch( e => alert( e ) )
          .then( data => { console.log( data ); this.setState({ parsed: true }) } );
    }
    
    format( s ){
        return s
          .replace( /(^(")|msgid "|msgid |msgid_plural "|msgid_plural |msgstr "|msgstr |msgstr\[(.*)\] "|msgstr\[(.*)\] |(")$)/gi,  '' )
          .replace( /% s/gi,  '%s' )
          .replace( /% i/gi,  '%i' )
          .replace( /% d/gi,  '%d' )
          .replace( /\\ "/gi, '\\"' );
    }
    
    pasted(){
        document.getElementById("paste-all-popup").classList.remove("visible");
        let v = document.getElementById("paste_all").value;
        if( ! v ) return;
        this.parsePasted( v );
    }
    
    parsePasted( v ){
        let t = Date.now();
        let lines = v.split('\n');
        if( ! lines.length )
            lines = [ v ];
        let pairs = [], { data } = this.state, pasted = '';
        for( let i = 0; i < lines.length; i++ )
            if( data[i] ) {
                data[i].translate = this.format( lines[i] );
                pasted += data[i].translate + "\n";
                pairs.push(<Pair id={data[i].id} translate={data[i].translate} index={i} key={"x-pair-" + t + "-" + i}
                                 onChange={this.changed}/>);
            }
        this.setState( { data: data, pairs: pairs, parsed: true, pasted: pasted } );
    }
    
    download(){
        let { header, data } = this.state;
        let text = "msgid \"\"\nmsgstr \"\"\n\n" + header + "\n\n";
        let prev = {};
        for( const item of data ){
            if( item.plural && prev.id ) {
                text += "msgid \"" + prev.id + "\"\n" +
                  "msgid_plural \"" + item.id + "\"\n" +
                  "msgstr[0] \"" + prev.translate + "\"\n" +
                  "msgstr[1] \"" + item.translate + "\"\n\n";
                prev = {};
            } else {
                if ( prev.id )
                    text += "msgid \"" + prev.id + "\"\n" +
                            "msgstr \"" + prev.translate + "\"\n\n";
                prev = item;
            }
        }
        if ( prev.id )
            text += "msgid \"" + prev.id + "\"\n" +
                    "msgstr \"" + prev.translate + "\"\n\n";
        let _data = new Blob( [text], {type: 'text/x-gettext-translation'} );
        window.location.href = window.URL.createObjectURL( _data );
    }
    
    showPasted(){
        let { changed, data, pasted } = this.state
        if( changed ) {
            pasted = '';
            for (const item of data)
                pasted += item.translate + "\n";
            document.getElementById("paste_all").value = pasted;
        }
        document.getElementById("paste-all-popup").classList.add( "visible" );
    }
    
    render() {
        let { parsed, text, pairs, pasted } = this.state
        if( ! parsed ) return(<div className={'parsing'}><img alt={"loading"} src={loading} /></div>);
        return (
          <div>
              <button onClick={this.translate} className={"btn-auto-translate"}>AutoTranslate</button>
              <button onClick={function(){
                  document.getElementById("copy-all-popup").classList.add( "visible" );
              }} className={"btn-copy-all"}>Copy all original strings</button>
              <div className={"popup"} id={"copy-all-popup"}>
                  <div className={"shade"} onClick={function(){
                      document.getElementById("copy-all-popup").classList.remove("visible");
                      document.getElementById("copy_all").select();
                  }}/>
                  <textarea className={"content copy-all-values"} id={"copy_all"} defaultValue={text}/>
              </div>
              <button onClick={this.showPasted} className={"btn-paste-all"}>Paste all translations</button>
              <div className={"popup"} id={"paste-all-popup"}>
                  <div className={"shade"} onClick={function(){
                      document.getElementById("paste-all-popup").classList.remove("visible")
                  }}/>
                  <div className={"content"}>
                      <textarea placeholder={"Paste all the translated strings here..."} defaultValue={pasted} className={"paste-all-values"} id={"paste_all"} />
                      <button onClick={this.pasted}>Save</button>
                  </div>
              </div>
              <div className={"tr-cols"}>{pairs}</div>
              <button className={"download-butt"} onClick={this.download}>Download new PO file</button>
          </div>
        )
    }
}

export default Parser