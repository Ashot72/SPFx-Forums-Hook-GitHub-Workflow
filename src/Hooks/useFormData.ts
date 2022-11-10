import { useEffect, useState } from "react"

const useFormData = (isOpen: boolean, data) => {
    const [formData, setFormData] = useState({})

    useEffect(() => {
        if (!isOpen) { setFormData(data) }
    }, [isOpen])

    return formData
}

export default useFormData