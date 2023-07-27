import { TasksStateType } from '../App';
import { v1 } from 'uuid';
import {_SetTodoListsType, AddTodolistActionType, RemoveTodolistActionType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
    type: 'REMOVE-TASK',
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: 'ADD-TASK',
    task: TaskType
}

export type ChangeTaskStatusActionType = {
    type: 'CHANGE-TASK-STATUS',
    todolistId: string
    taskId: string
    status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
    type: 'CHANGE-TASK-TITLE',
    todolistId: string
    taskId: string
    title: string
}

type ActionsType = RemoveTaskActionType | AddTaskActionType
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | _SetTodoListsType
    | ReturnType<typeof setTasksAC>

const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case "SET_TODO_LISTS": {
            const copyState = {...state} //создаем копию стейта
            action.todos.forEach((tl)=> {
                copyState[tl.id] = []
            })//когда получаем тудулисты
            //пробегаемся форИчом берем ключи из пришедших тудулистов
            //каждому ключу присвоили массив пустой
            return copyState
        }
        case "SET-TASKS": {
            //первый запрос который зарождается в приложении это запрос за тудулистами
            //сразу устанавливает массив тудулистов через тудулист редьюсер "SET_TODO_LISTS"
            //нам необходимо заполнить пустые массивы тем что мы получим
            //мы будем искать по ключу куда нам приткнуть массив который мы получили при запросе
            return {
                ...state, //делаем копию стейта
                [action.todoId]: action.tasks //обращаемся к нужному нам тудулисту по id
                // и этому тудулисту добавляем таски
            }
        }
        case 'REMOVE-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case 'ADD-TASK': {
            return {
                ...state,
                [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] //зелезаем в нужный массив
            };
        }
        case 'CHANGE-TASK-STATUS': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, status: action.status} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {
                ...state,
                [action.todolistId]: []
            }
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string): RemoveTaskActionType => {
    return {type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType): AddTaskActionType => {
    return {type: 'ADD-TASK',task}
}
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string): ChangeTaskStatusActionType => {
    return {type: 'CHANGE-TASK-STATUS', status, todolistId, taskId}
}
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string): ChangeTaskTitleActionType => {
    return {type: 'CHANGE-TASK-TITLE', title, todolistId, taskId}
}


export const setTasksAC = (tasks: TaskType[], todoId: string) => ({type: 'SET-TASKS', tasks, todoId} as const)

//TC Thunk Creator
export const getTasksTC = (todoId: string) => (dispatch: Dispatch) =>  {
    todolistsAPI.getTasks(todoId) //берем айдишку из замыкания из санкКреэйтора
        .then((res) => {
            dispatch(setTasksAC(res.data.items, todoId))
        }) //дожидаемся результата
}// для этого запроса нам необходимо прокинуть todoId чтобы получить массив тасок
//соответственно эту саночку будет логичнее всего использовать в компоненте Todolist
//На уровне App мы начинаем мапить тудулисты, в App прокидываем todoId
//следовательно в Todolist правильно будет задиспатчить санку

export const deleteTaskTC = (todoId: string, taskId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todoId,taskId)
        .then((res) => {
            dispatch(removeTaskAC(taskId, todoId))
        })
}

export const createTaskTC = (todoId: string, title: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTask(todoId,title)
        .then((res) => {

            dispatch(addTaskAC(res.data.data.item))
        })
}

export const changeTaskStatusTC = (taskId: string, status: TaskStatuses, todolistId: string) =>
    (dispatch: Dispatch, getState:()=> AppRootStateType) => {
    //middleware закдывает вторым параметром в санку getState
    //getState это функция которая ничего не принимает и возвращает AppRootStateType
    //ищем таску которую будем обновлять
    const task = getState().tasks[todolistId].find((t) => t.id===taskId)

    const model: UpdateTaskModelType = {
        title: task!.title,
        startDate: task!.startDate,
        priority: task!.priority,
        description: task!.description,
        deadline: task!.deadline,
        status: status
    }
    //восклицательный знак ! в typescript говорит что элемент будет
    //если task.title или другое свойство будет undefined приложение упадет
    //или делать if(task) {model....}

    todolistsAPI.updateTask(todolistId, taskId, model)
        .then((res) => {
            dispatch(changeTaskStatusAC(taskId, status, todolistId))
        })
}
//будем обновлять статус таски можно было бы собирать данные с фронта но легче использовать getState
//getState позволяет в каждой санки получить доступ к текущему стейту
