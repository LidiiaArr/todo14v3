import { tasksReducer } from './tasks-reducer';
import { todolistsReducer } from './todolists-reducer';
import {AnyAction, applyMiddleware, combineReducers, createStore, legacy_createStore} from 'redux';
import thunk, {ThunkDispatch} from 'redux-thunk'
import {useDispatch} from "react-redux";

// объединяя reducer-ы с помощью combineReducers,
// мы задаём структуру нашего единственного объекта-состояния
const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer
})
// непосредственно создаём store
export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));
// определить автоматически тип всего объекта состояния
//когда у нас создается стор первым параметром мы передаем рутовый редьюсер
//вторым параметром мы передаем мидлваер (подключаем middleware)

export type AppRootStateType = ReturnType<typeof rootReducer>

export type AppDispatchType = ThunkDispatch<AppRootStateType, any, AnyAction>
//AnyAction будет принимать как обычные экшены так и не обычные санку например

export const useAppDispatch = () => useDispatch<AppDispatchType>()
//useAppDispatch функция которая вызывает хук useDispatch
//который возвращает dispatch протипизированный

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store;
