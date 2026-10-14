import { dispatch } from '@wordpress/data';
import deprecated from '@wordpress/deprecated';
import { unlock } from '../lock-unlock';
import { store as editorStore } from '../store';

/**
 * @typedef {import('@wordpress/dataviews').Action} Action
 * @typedef {import('@wordpress/dataviews').Field} Field
 */

/*
 * Both functions below keep their parameters so an existing call still type
 * checks, and ignore them.
 */
/* eslint-disable no-unused-vars */

/**
 * Has no effect: every action of an entity is registered on the server.
 *
 * Register the action in PHP on the `wp_actions_api_init` action instead,
 * with a script module for the parts PHP cannot serialize (`callback`,
 * `RenderModal`, `isEligible`…).
 *
 * @deprecated since Gutenberg 24.3. Register the action in PHP on the
 *             `wp_actions_api_init` action instead, with a script module for
 *             its JavaScript parts.
 *
 * @param {string} kind   Entity kind.
 * @param {string} name   Entity name.
 * @param {Action} config Action configuration.
 */
export function registerEntityAction( kind, name, config ) {
	deprecated( 'wp.editor.registerEntityAction', {
		since: '24.3',
		plugin: 'Gutenberg',
		alternative: 'the `wp_actions_api_init` PHP action',
	} );
}

/**
 * Has no effect: every action of an entity is registered on the server.
 *
 * Unregister the action in PHP on the `wp_actions_api_init` action instead.
 *
 * @deprecated since Gutenberg 24.3. Unregister the action in PHP on the
 *             `wp_actions_api_init` action instead.
 *
 * @param {string} kind     Entity kind.
 * @param {string} name     Entity name.
 * @param {string} actionId Action ID.
 */
export function unregisterEntityAction( kind, name, actionId ) {
	deprecated( 'wp.editor.unregisterEntityAction', {
		since: '24.3',
		plugin: 'Gutenberg',
		alternative: 'the `wp_actions_api_init` PHP action',
	} );
}

/* eslint-enable no-unused-vars */

/**
 * Registers a new DataViews field.
 *
 * This is an experimental API and is subject to change.
 * it's only available in the Gutenberg plugin for now.
 *
 * @param {string} kind   Entity kind.
 * @param {string} name   Entity name.
 * @param {Field}  config Field configuration.
 */
export function registerEntityField( kind, name, config ) {
	const { registerEntityField: _registerEntityField } = unlock(
		dispatch( editorStore )
	);

	if ( globalThis.IS_GUTENBERG_PLUGIN ) {
		_registerEntityField( kind, name, config );
	}
}

/**
 * Unregisters a DataViews field.
 *
 * This is an experimental API and is subject to change.
 * it's only available in the Gutenberg plugin for now.
 *
 * @param {string} kind    Entity kind.
 * @param {string} name    Entity name.
 * @param {string} fieldId Field ID.
 */
export function unregisterEntityField( kind, name, fieldId ) {
	const { unregisterEntityField: _unregisterEntityField } = unlock(
		dispatch( editorStore )
	);

	if ( globalThis.IS_GUTENBERG_PLUGIN ) {
		_unregisterEntityField( kind, name, fieldId );
	}
}
