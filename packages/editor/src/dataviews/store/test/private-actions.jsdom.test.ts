import { describe, expect, it, vi } from 'vitest';
import postTypeSupports from '@wordpress/core-actions/post_type_supports';
import wpBlock from '@wordpress/core-actions/wp_block';
import type { Action, Field } from '@wordpress/dataviews';
import { lock } from '../../../lock-unlock';
import { registerPostTypeSchema } from '../private-actions';

vi.hoisted( () => globalThis.wpVitest.mockMatchMedia() );

// The script module of the template part actions fails to load in these tests.
vi.mock( import( '@wordpress/core-actions/wp_template_part' ), () =>
	Promise.reject( new Error( 'Failed to fetch' ) )
);

const POST_TYPES = {
	page: {
		slug: 'page',
		viewable: true,
		supports: {
			title: true,
			editor: true,
			revisions: true,
			'page-attributes': true,
		},
	},
	wp_block: {
		slug: 'wp_block',
		viewable: false,
		supports: { title: true, editor: true, revisions: true },
	},
	wp_template_part: {
		slug: 'wp_template_part',
		viewable: false,
		supports: { title: true, revisions: true },
	},
};

/**
 * Runs `registerPostTypeSchema()` against a registry that resolves the post
 * type, lets the user create posts, and has a block theme active.
 *
 * @param postType The post type.
 * @return The actions and the fields registered for the post type.
 */
async function register( postType: keyof typeof POST_TYPES ) {
	const actions: Action< any >[] = [];
	const fields: Field< any >[] = [];
	const editorSelectors = { getEditorSettings: () => ( {} ) };
	lock( editorSelectors, { isEntityReady: () => false } );
	const editorActions = {};
	lock( editorActions, {
		setIsReady: () => {},
		registerEntityAction: (
			kind: string,
			name: string,
			action: Action< any >
		) => actions.push( action ),
		registerEntityField: (
			kind: string,
			name: string,
			field: Field< any >
		) => fields.push( field ),
	} );
	const registry = {
		select: () => editorSelectors,
		dispatch: () => editorActions,
		resolveSelect: () => ( {
			getPostType: async () => POST_TYPES[ postType ],
			canUser: async () => true,
			getCurrentTheme: async () => ( { is_block_theme: true } ),
		} ),
		batch: ( callback: () => void ) => callback(),
	};
	await registerPostTypeSchema( postType )( { registry } );
	return { actions, actionIds: actions.map( ( { id } ) => id ), fields };
}

describe( 'registerPostTypeSchema', () => {
	it( 'registers the default actions from their script module', async () => {
		const { actions, actionIds } = await register( 'page' );

		expect( actionIds ).toEqual( [
			'view-post',
			'view-post-revisions',
			'duplicate-post',
			'rename-post',
			'order-pages',
			'restore',
			'reset-post',
			'delete-post',
			'move-to-trash',
			'permanently-delete',
		] );
		for ( const action of actions ) {
			expect( action ).toBe( postTypeSupports[ action.id ] );
		}
	} );

	it( 'registers the pattern actions from their script module', async () => {
		const { actions, actionIds } = await register( 'wp_block' );

		expect( actionIds ).toEqual( [
			'view-post-revisions',
			'duplicate-pattern',
			'rename-post',
			'export-pattern',
			'restore',
			'reset-post',
			'delete-post',
			'move-to-trash',
			'permanently-delete',
		] );
		expect( actions ).toContain( wpBlock[ 'duplicate-pattern' ] );
		expect( actions ).toContain( wpBlock[ 'export-pattern' ] );
	} );

	it( 'registers the fields and the other actions when a script module fails to load', async () => {
		const { actionIds, fields } = await register( 'wp_template_part' );

		expect( actionIds ).toEqual( [
			'view-post-revisions',
			'rename-post',
			'restore',
			'reset-post',
			'delete-post',
			'move-to-trash',
			'permanently-delete',
		] );
		expect( fields ).not.toHaveLength( 0 );
		expect( console ).toHaveWarnedWith(
			'Could not load the core actions of the wp_template_part post type.',
			expect.any( Error )
		);
	} );
} );
