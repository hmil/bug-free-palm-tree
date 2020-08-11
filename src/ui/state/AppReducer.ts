import * as actions from './AppActions';
import { AppState, appInitialState } from './AppState';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch } from 'react';

type UnionOfValues<T extends { [k: string]: any}, K extends keyof T> = K extends keyof T ? ReturnType<T[K]> : never;
export type AppActions = UnionOfValues<typeof actions, keyof typeof actions>;

export function appReducer(state: AppState | undefined, action: AppActions): AppState {
    console.log('Reducing: ' + action.type);

    if (state === undefined) {
        console.warn('State was empty');
        return appInitialState;
    }
    const myAction = actions[action.type];
    if (!myAction) {
        console.warn(`Cannot reduce: ${action.type}`);
        return state;
    }
    // I can't get TypeScript to understand that the union on the left hand side has a type-safe 1:1 mapping with the rhs
    try {
        return myAction.reduce(state, action.data as any);
    } catch (e) {
        console.error(e);
    }
    return state;
}


export function useStateSelector<R>(selector: (s: AppState) => R) {
    return useSelector(selector);
}

export function useStateDispatch(): Dispatch<AppActions> {
    return useDispatch();
}
