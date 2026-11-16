/**
 * The visitor's name on the film's boards (content/home-film.ts). Its own
 * module, so the film's engine, which runs in the browser, does not pull the
 * rest of the site's content into its script.
 */

/** Stands on every board until the visitor types their own. Kept on the device only. */
export const DEFAULT_SHOP_NAME = 'Your shop name'
/** The longest name the boards letter. */
export const SHOP_NAME_MAX = 24
