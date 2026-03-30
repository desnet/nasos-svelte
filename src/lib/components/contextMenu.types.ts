export type MenuDivider = { kind: 'divider' };
export type MenuSection = { kind: 'section'; text: string };
export type MenuLabel = { kind: 'label'; text: string };
export type MenuAction = {
  kind: 'item';
  icon: string;
  label: string;
  danger?: boolean;
  action: () => void;
};
export type MenuItem = MenuDivider | MenuSection | MenuLabel | MenuAction;
