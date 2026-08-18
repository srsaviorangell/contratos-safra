import type { CropType, Contract } from "./types"
import crypto from "crypto-js"

const STORAGE_KEY = "contrato-safra-db"

interface StoredUser {
  id: string
  email: string
  password: string
  full_name: string
  phone: string
  region: string | null
  created_at: string
}

interface Session {
  token: string
  user_id: string
  created_at: string
}

interface Database {
  users: StoredUser[]
  sessions: Session[]
  contracts: StoredContract[]
  crop_types: CropType[]
}

interface StoredContract extends Omit<Contract, "crop_types"> {}

const defaultCrops: CropType[] = [
  { id: "cebola", name: "Cebola", default_unit: "saco", description: "Saco de 20kg", is_active: true },
  { id: "tomate", name: "Tomate", default_unit: "caixa", description: "Caixa classificada em 1ª, 2ª ou 3ª qualidade", is_active: true },
  { id: "beterraba", name: "Beterraba", default_unit: "kg", description: null, is_active: true },
  { id: "cenoura", name: "Cenoura", default_unit: "kg", description: null, is_active: true },
]

function readDb(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { users: [], sessions: [], contracts: [], crop_types: defaultCrops }
    return JSON.parse(raw)
  } catch {
    return { users: [], sessions: [], contracts: [], crop_types: defaultCrops }
  }
}

function writeDb(db: Database) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function hashPassword(password: string): string {
  return crypto.SHA256(password).toString()
}

function generateToken(): string {
  return crypto.lib.WordArray.random(16).toString()
}

export const store = {
  auth: {
    signUp(email: string, password: string, fullName: string, phone: string) {
      const db = readDb()
      const existing = db.users.find((u) => u.email === email)
      if (existing) throw new Error("E-mail já cadastrado")

      const user: StoredUser = {
        id: crypto.lib.WordArray.random(16).toString(),
        email,
        password: hashPassword(password),
        full_name: fullName,
        phone,
        region: null,
        created_at: new Date().toISOString(),
      }

      const session: Session = {
        token: generateToken(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      }

      db.users.push(user)
      db.sessions.push(session)
      writeDb(db)

      return { user: { ...user, password: undefined }, session }
    },

    signIn(email: string, password: string) {
      const db = readDb()
      const user = db.users.find((u) => u.email === email)
      if (!user || user.password !== hashPassword(password)) {
        throw new Error("E-mail ou senha inválidos")
      }

      const session: Session = {
        token: generateToken(),
        user_id: user.id,
        created_at: new Date().toISOString(),
      }

      db.sessions.push(session)
      writeDb(db)

      return { user: { ...user, password: undefined }, session }
    },

    getUserByToken(token: string) {
      const db = readDb()
      const session = db.sessions.find((s) => s.token === token)
      if (!session) return null
      const user = db.users.find((u) => u.id === session.user_id)
      if (!user) return null
      return { ...user, password: undefined }
    },

    removeSession(token: string) {
      const db = readDb()
      db.sessions = db.sessions.filter((s) => s.token !== token)
      writeDb(db)
    },
  },

  contracts: {
    create(data: Omit<StoredContract, "id" | "created_at" | "updated_at">): StoredContract {
      const db = readDb()
      const contract: StoredContract = {
        ...data,
        id: crypto.lib.WordArray.random(16).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      db.contracts.push(contract)
      writeDb(db)
      return contract
    },

    listBySeller(sellerId: string): StoredContract[] {
      const db = readDb()
      return db.contracts
        .filter((c) => c.seller_id === sellerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((c) => {
          const cropType = db.crop_types.find((ct) => ct.id === c.crop_type_id)
          return { ...c, crop_types: cropType ? { name: cropType.name } : null }
        })
    },

    getById(id: string): (StoredContract & { crop_types?: { name: string } | null }) | null {
      const db = readDb()
      const c = db.contracts.find((c) => c.id === id)
      if (!c) return null
      const cropType = db.crop_types.find((ct) => ct.id === c.crop_type_id)
      return { ...c, crop_types: cropType ? { name: cropType.name } : null }
    },

    getByToken(token: string): StoredContract | undefined {
      const db = readDb()
      return db.contracts.find((c) => c.confirmation_token === token)
    },

    update(id: string, data: Partial<StoredContract>) {
      const db = readDb()
      const index = db.contracts.findIndex((c) => c.id === id)
      if (index === -1) return null
      db.contracts[index] = { ...db.contracts[index], ...data, updated_at: new Date().toISOString() }
      writeDb(db)
      return db.contracts[index]
    },

    send(contractId: string): { token: string; expiresAt: string } {
      const token = crypto.lib.WordArray.random(16).toString()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      store.contracts.update(contractId, {
        status: "aguardando_confirmacao",
        confirmation_token: token,
        confirmation_expires_at: expiresAt,
      })
      return { token, expiresAt }
    },
  },

  cropTypes: {
    list(): CropType[] {
      return readDb().crop_types.filter((c) => c.is_active)
    },
  },
}

export { readDb }
export type { StoredContract }
