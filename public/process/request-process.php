<?php

defined( 'PO' ) or die();

final class Process {
	
	/**
	 * Url to send request to
	 *
	 * @var string
	 */
	protected static $url = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20190329T100221Z.e43e41db3fe2c0ff.a863e85f7187ce0783e8fa44987eefed186747fb";
	
	public static function init(){
		$data = json_decode( file_get_contents('php://input'), true );
		if( ! empty( $data['translate_x_data'] ) )
			self::response( [ 'translated' => self::get_translations( $data['translate_x_data'] ) ] );
	}
	
	protected static function get_translations( $data ){
		$result = '';
		do {
			if( $p = strrpos( $data['text'], "\n", 1000 ) ) {
				$text         = substr( $data['text'], 0, $p );
				$data['text'] = substr( $data['text'], $p + 1 );
			} else {
				$text         = $data['text'];
			}
			$url = self::$url . '&lang=' . $data['from'] . '-' . $data['to'] . '&format=text';
			$context  = stream_context_create( [
				'http' => [
					'method' => 'POST',
					'timeout' => 30,
					'header' => "Content-Type: application/x-www-form-urlencoded\n",
					'content' => 'text=' . $text
				]
			] );
			
			$r = @file_get_contents( $url, false, $context );
			if( $r[0] === '{' ) {
				$rz      = json_decode( $r, true );
				$result .= rtrim( $rz['text'][0], "\n" ) . "\n";
			}
		} while( $p && strlen( $data['text'] ) > 1000 );
		return $result;
	}
	
	protected static function response( $data ){
		header( "Content-Type: application/json" );
		die( json_encode( $data ) );
	}
	
}

Process::init();