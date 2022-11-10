import { sp } from '@pnp/sp';
import { useEffect, useState } from "react"

const useCurrentUser = () => {
    const [user, setUser]: any = useState({})

    useEffect(() => {
        (async () => {
            setUser(await sp.web.currentUser())
        })()
    }, [])
    return user
}

export default useCurrentUser