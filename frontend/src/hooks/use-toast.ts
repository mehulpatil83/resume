import { useState, useEffect } from "react"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = any // Simplified for now

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type ActionType = {
    type: string
    toast?: any
    toastId?: string
}

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
} as const

let memoryState: any = { toasts: [] }

function dispatch(action: ActionType) {
    memoryState = { ...memoryState, toasts: [] } // Fake dispatch
}

function toast({ ...props }: any) {
    console.log("Toast:", props) // Fallback to console for now as we don't have full toaster context
    alert(props.title + "\n" + props.description)
    return {
        id: genId(),
        dismiss: () => { },
        update: () => { },
    }
}

function useToast() {
    const [state, setState] = useState<any>(memoryState)

    useEffect(() => {
        // listeners...
        return () => { }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
}

export { useToast, toast }
