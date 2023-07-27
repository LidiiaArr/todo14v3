import { v1 } from 'uuid';
import {TaskType, todolistsAPI, TodolistType} from '../api/todolists-api'
import {useDispatch} from "react-redux";
import {Dispatch} from "redux";
import {addTaskAC, removeTaskAC} from "./tasks-reducer";

export type RemoveTodolistActionType = {
    type: 'REMOVE-TODOLIST',
    id: string
}
export type AddTodolistActionType = {
    type: 'ADD-TODOLIST',
    title: string
    todolistId: string
}
export type ChangeTodolistTitleActionType = {
    type: 'CHANGE-TODOLIST-TITLE',
    id: string
    title: string
}
export type ChangeTodolistFilterActionType = {
    type: 'CHANGE-TODOLIST-FILTER',
    id: string
    filter: FilterValuesType
}

type ActionsType = RemoveTodolistActionType | AddTodolistActionType
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | _SetTodoListsType

const initialState: Array<TodolistDomainType> = [
    /*{id: todolistId1, title: 'What to learn', filter: 'all', addedDate: '', order: 0},
    {id: todolistId2, title: 'What to buy', filter: 'all', addedDate: '', order: 0}*/
]

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case "SET_TODO_LISTS": {
            return action.todos.map((tl) => ({...tl, filter: 'all'}))
        } //для проверки в браузере store.getState()
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.id)
        }
        case 'ADD-TODOLIST': {
            return [{
                id: action.todolistId,
                title: action.title,
                filter: 'all',
                addedDate: '',
                order: 0
            }, ...state]
        }
        case 'CHANGE-TODOLIST-TITLE': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.title = action.title;
            }
            return [...state]
        }
        case 'CHANGE-TODOLIST-FILTER': {
            const todolist = state.find(tl => tl.id === action.id);
            if (todolist) {
                // если нашёлся - изменим ему заголовок
                todolist.filter = action.filter;
            }
            return [...state]
        }
        default:
            return state;
    }
}

export const removeTodolistAC = (todolistId: string): RemoveTodolistActionType => {
    return {type: 'REMOVE-TODOLIST', id: todolistId}
}
// export const addTodolistAC = (title: string): AddTodolistActionType => {
//     return {type: 'ADD-TODOLIST', title: title, todolistId: v1()}
// }
export const addTodolistAC = (title: string, todolistId: string): AddTodolistActionType => {
    return {type: 'ADD-TODOLIST', title: title, todolistId: todolistId}
}
export const changeTodolistTitleAC = (id: string, title: string): ChangeTodolistTitleActionType => {
    return {type: 'CHANGE-TODOLIST-TITLE', id: id, title: title}
}
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType): ChangeTodolistFilterActionType => {
    return {type: 'CHANGE-TODOLIST-FILTER', id: id, filter: filter}
}

export type setTodoListsType = { //ручная типизация
    type: 'SET_TODO_LISTS'
    todos: TodolistType[]
}

export type _SetTodoListsType = ReturnType<typeof setTodoLists>//если поставить в setTodoLists = (todos: TodolistType[]): _SetTodoListsType
//появиться циклическая зависимость поэтому в setTodoLists возвращаемое значение не указываем
//typeof setTodoLists типизирует всю функцию
//ReturnType отсекает чтобы осталось только возвращаемый тип
export const setTodoLists = (todos: TodolistType[]) => ({type: 'SET_TODO_LISTS', todos} as const)
//возвращаемое значение воспринимается как строка а не как уникальное значение type: string
//редьюсер будет ругаться на строку ему нужен уникальный тип
//уникальность создаем с помощью as const



//у thunk должен быть санкКреэйтор
//санкКреэйтор нужен чтобы передать в thunk что то или не передовать
export const getTodoListsTC = () => (dispatch: Dispatch) => {
    todolistsAPI.getTodolists()
        .then((res) => { //дожидаемся результата
            dispatch(setTodoLists(res.data))//диспатчим данные с сервера
        })
}

export const deleteTodoListTC = (todoId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTodolist(todoId)
        .then((res) => {
            dispatch(removeTodolistAC(todoId))
        })
}

export const createTodoListTC = ( title: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTodolist(title)
        .then((res) => {
            dispatch(addTodolistAC(res.data.data.item.title, res.data.data.item.id))
        })

    // todolistsAPI.createTask(todoId,title)
    //     .then((res) => {
    //
    //         dispatch(addTaskAC(res.data.data.item))
    //     })
}

