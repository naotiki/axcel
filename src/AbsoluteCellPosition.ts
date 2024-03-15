import {
  GuardModelColumn,
  GuardModelSelector,
  GuardModelBase
} from "./library/guard/GuardModel";


export type AbsoluteCellPosition<T extends GuardModelBase> = {
  id: GuardModelSelector<T>;
  column: GuardModelColumn<T>;
};
