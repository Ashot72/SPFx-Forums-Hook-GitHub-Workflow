import { useWebPartContext } from "../Contexts/WebPartContext"

const useContext = () => {
    const { context } = useWebPartContext()
    return context
}

export default useContext