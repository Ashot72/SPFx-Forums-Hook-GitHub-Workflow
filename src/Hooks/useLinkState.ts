import { useEffect, useState } from "react"

const useLinkState = (isOpen: boolean, state: boolean) => {
    const [linkState, setLinkState] = useState(state)

    useEffect(() => {
        if (isOpen && linkState) {
            setLinkState(false)
        }
    }, [isOpen])

    return linkState
}

export default useLinkState