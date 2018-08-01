<?php
/*
 * Plugin Name:       Featured Icon
 * Plugin URI:        http://wordpress.org/plugins/featured-icon/
 * Description:       WordPress ships with a Featured Image functionality. This plugins adds a similar functionality, labeled as a Featured Icon. Forked from Featured Galleries v2.0.1
 * Version:           1.0.0
 * Author:            Andy Mercer
 * Author URI:        http://www.andymercer.net
 * Text Domain:       featured-icon
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
*/


/***********************************************************************/
/*************************  DEFINE CONSTANTS  **************************/
/***********************************************************************/

define( 'FIAZM_PLUGIN_VERSION', '1.0.0' );

define( 'FIAZM_PLUGIN_FILE', __FILE__ );

if ( version_compare( PHP_VERSION, '5.4', '<' ) ) {

	add_action('admin_notices', 'my_plugin_notice');

    function my_plugin_notice(){      

		echo '
			<div class="error below-h2">
				<p>
				 ' . sprintf( 'Featured Icon requires PHP version 5.4 or greater. You are currently running version: %s. Please deactivate Featured Galleries or upgrade your PHP.', PHP_VERSION ) . '
				</p>
			</div>
		';
    }

} else {

	/***********************************************************************/
	/**********************  INCLUDE REQUIRED FILES  ***********************/
	/***********************************************************************/

	require_once( plugin_dir_path(FIAZM_PLUGIN_FILE) . 'includes/controller.php' );

	require_once( plugin_dir_path(FIAZM_PLUGIN_FILE) . 'includes/public-functions.php' );

	/***********************************************************************/
	/*****************************  INITIATE  ******************************/
	/***********************************************************************/

	new FIAZM_Controller();

}