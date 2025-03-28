import { TWidget } from "./Widget";

export type TDashboardEdits = {
  widgets: {
    add: TWidget[];
    update: TWidget[];
    remove: TWidget[];
  };
};
