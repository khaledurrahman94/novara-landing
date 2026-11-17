import type { Feature } from '../../../content/features';

export interface NavLink {
  label: string;
  href: string;
}

export interface MenuItem extends Feature {
  href: string;
  current: boolean;
}
