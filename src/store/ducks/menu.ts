import { AnyAction } from 'redux';

/** The reducer name */
export const reducerName = 'menu';

/** Types of Menu Items */
export const FORM_TYPE = 'form';
export type FORM_TYPE = typeof FORM_TYPE;
export const LIST_TYPE = 'list';
export type LIST_TYPE = typeof LIST_TYPE;
export const MODULE_TYPE = 'container';
export type MODULE_TYPE = typeof MODULE_TYPE;

/** interface for multi language label object */
export interface Label {
  [key: string]: string;
}

/** interface for form menu */
export interface FormMenu {
  type: FORM_TYPE;
  name: string;
  label: Label;
  img_id: number;
  form_id: number;
}

/** interface for List menu */
export interface ListMenu {
  type: LIST_TYPE;
  name: string;
  label: Label;
  img_id: number;
  list_id: number;
}

/** interface for Module menu */
export interface ModuleMenu {
  type: MODULE_TYPE;
  name: string;
  label: Label;
  img_id: number;
  children: Array<ModuleMenu | ListMenu | FormMenu>;
}

// actions

/** SET_MENU_ITEM action type */
export const SET_MENU_ITEM = 'opensrp/reducer/menu/SET_MENU_ITEM';

/** interface for SET_MENU_ITEM action */
export interface SetMenuItemAction extends AnyAction {
  menuItem: FormMenu | ListMenu | ModuleMenu | null;
  type: typeof SET_MENU_ITEM;
}

/** Create type for menu reducer actions */
export type MenuActionTypes = SetMenuItemAction | AnyAction;

// action creators

/** set menu item action creator
 * @param {ModuleMenu | FormMenu | ListMenu} menuItem - menuItem add to store
 * @return {SetMenuItemAction} - an action to add menuItem to store
 */
export const SetMenuItem = (menuItem: ModuleMenu | FormMenu | ListMenu): SetMenuItemAction => ({
  menuItem,
  type: SET_MENU_ITEM,
});
