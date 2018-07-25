/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/compose';
import { createContext, RawHTML } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { serialize } from '../api';

const { Consumer, Provider } = createContext( {
	BlockContent: () => {},
} );

/**
 * An internal block component used in block content serialization to inject
 * nested block content within the `save` implementation of the ancestor
 * component in which it is nested. The component provides a pre-bound
 * `BlockContent` component via context, which is used by the developer-facing
 * `InnerBlocks.Content` component to render block content.
 *
 * @return {WPElement} Element with BlockContent injected via context.
 *
 * @example
 *
 * ```jsx
 * <BlockContentProvider innerBlocks={ innerBlocks }>
 * 	{ blockSaveElement }
 * </BlockContentProvider>
 * ```
 */
const BlockContentProvider = ( { children, innerBlocks } ) => {
	const BlockContent = () => {
		// Value is an array of blocks, so defer to block serializer
		const html = serialize( innerBlocks );

		// Use special-cased raw HTML tag to avoid default escaping
		return <RawHTML>{ html }</RawHTML>;
	};

	return (
		<Provider value={ { BlockContent } }>
			{ children }
		</Provider>
	);
};

/**
 * A Higher Order Component used to inject BlockContent context to the
 * wrapped component.
 *
 * @param {Function} mapContextToProps Function called on every context change,
 *                                     expected to return object of props to
 *                                     merge with the component's own props.
 *
 * @return {Component} Enhanced component with injected context as props.
 */
export const withBlockContentContext = ( mapContextToProps ) => createHigherOrderComponent( ( OriginalComponent ) => {
	return ( props ) => (
		<Consumer>
			{ ( context ) => (
				<OriginalComponent
					{ ...props }
					{ ...mapContextToProps( context, props ) }
				/>
			) }
		</Consumer>
	);
}, 'withBlockContentContext' );

export default BlockContentProvider;
