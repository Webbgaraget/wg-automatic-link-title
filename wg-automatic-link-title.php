<?php
/**
 * Plugin Name: Automatic Link Title
 * Version:		0.0.1
 * Plugin URI:	http://www.webbgaraget.se
 * Description: Tries to automatically download the <title>-tag content from the URL specified when adding a new link
 * Author:		Anders Lisspers, Webbgaraget
 * Author URI:	http://www.webbgaraget.se
 */

class WG_Automatic_Link_Title
{
	/**
	 * Constructor
	 */
	public function __construct()
	{
		add_action( 'init', array( $this, 'init' ) );
	}
	
	/**
	 * Adds the actions for this plugin
	 * Action: init
	 */
	public function init()
	{
		add_action( 'admin_init', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_ajax_download_link_title', array( $this, 'download_link_title' ) );
	}
	
	/**
	 * Enqueues our JS
	 * Action: admin_init
	 */
	public function enqueue_assets()
	{
		wp_enqueue_script( 'automatic-link-title', plugins_url( '/script.js', __FILE__ ), array(), false, true );
	}
	
	/**
	 * AJAX action to download the content of the <title>-tag of a given URL
	 * Action: wp_ajax_download_link_title
	 */
	public function download_link_title()
	{
		$url = $_POST['url'];
		$file = @file_get_contents( $url );

		if ( false === $file )
		{
			$return = array(
				'status' => 'fail',
				'error'  => 'url-unavailable',
			);
		}
		elseif ( preg_match( "/<title>(.*)<\/title>/siU", $file, $result ) )
		{
			$title = preg_replace( '/\s+/', ' ', $result[1] );
			$title = trim( $title );
			$title = html_entity_decode( $title, ENT_QUOTES, 'UTF-8' );
			$return = array(
				'status' => 'success',
				'title'	 => $title,
			);
		}
		else
		{
			$return = array(
				'status' => 'fail',
				'error'  => 'no-title',
			);
		}
		
		header( "Content-type: application-x/json; charset=utf-8" );
		echo json_encode( $return );
		exit();		
	}
}
new WG_Automatic_Link_Title();

