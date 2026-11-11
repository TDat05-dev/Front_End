export type ContactType = 0 | 1

export interface Contact {
    name: string
    type: ContactType
    actionTime: string
}
