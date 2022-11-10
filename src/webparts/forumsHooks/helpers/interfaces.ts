import { Actions } from './constants';

export interface IForumsFormProp {
    action: Actions
    formState: any
    handleSubmit: () => void
    handleClose: () => void
}