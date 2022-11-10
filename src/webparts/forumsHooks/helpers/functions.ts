import { get } from '@microsoft/sp-lodash-subset'
import { WebPartContext } from '@microsoft/sp-webpart-base'

export const localeForDate = (context: WebPartContext): string => {
    const locale = context.pageContext.cultureInfo.currentCultureName

    switch (locale.toLowerCase()) {
        case 'fr-fr':
            return 'fn'
        case 'nl-nl':
            return 'nl'
        default:
            return 'en'
    }
}

export const getDetailError = (error: any) => {
    const odataError: string = get(
        error,
        'data.responseBody.["odata.error"].message.value'
    )

    if (odataError) {
        return odataError
    }
    else {
        let message = error.message
        if (message) {
            const index = message.indexOf('::>')
            if (index !== -1) {
                message = message.substring(index + 4)
                try {
                    message = JSON.parse(message)
                    message = get(message, '["odata.error"].message.value')
                } catch (e) {
                    message = error
                }
            }
        }
        return message || error
    }
}

export const daysInMonth = (m, y) => {
    switch (m) {
        case 1:
            return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28
        case 8:
        case 3:
        case 5:
        case 10:
            return 30
        default:
            return 31
    }
}