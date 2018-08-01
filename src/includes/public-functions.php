<?php

function get_post_icon_id( $postID = null ) {

	global $post;

	// CHECK TO SEE IF AN ID HAS BEEN PASSED. IF NOT, LOAD THE ID FROM $POST, IF POSSIBLE

	if ( $postID == null ) {

		// IF NO ID HAS BEEN PASSED, CHECK TO SEE IF WE ARE IN THE LOOP AND HAVE A $post. IF
		// WE DO, THEN LOAD THE POST ID FROM THE CURRENT POST. IF NOT, RETURN AN ERROR.

		if ( $post !== null ) {

			$postID = $post->ID;

		} else {

			return 'Error, requires a valid postID';

		}

	}

	// CHECK TO SEE IF WE ARE IN A PREVIEW. IF SO, LOAD THE TEMP METADATA. IF NOT, LOAD THE
	// PERM METADATA

	if ( is_preview( $postID ) ) {

		return get_post_meta( $postID, '_fiazm_temp_metadata', 1 );

	} else {

		return get_post_meta( $postID, '_fiazm_perm_metadata', 1 );

	}

}