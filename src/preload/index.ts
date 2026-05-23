import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {} as Record<string, unknown>)
