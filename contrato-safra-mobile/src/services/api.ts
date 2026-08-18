import AsyncStorage from "@react-native-async-storage/async-storage"

const USERS_KEY = "cf_users"
const SESSIONS_KEY = "cf_sessions"
const CONTRACTS_KEY = "cf_contracts"
const CROPS_KEY = "cf_crop_types"
const TOKEN_KEY = "auth_token"

interface StoredUser {
  id: string
  email: string
  password: string
  full_name: string
  phone: string
  created_at: string
}

interface StoredSession {
  token: string
  user_id: string
  created_at: string
}

interface StoredContract {
  id: string
  seller_id: string
  seller_name: string
  seller_document: string | null
  seller_contact: string | null
  buyer_name: string
  buyer_document: string | null
  buyer_contact: string | null
  crop_type_id: string | null
  crop_type_custom: string | null
  unit_type: string
  quantity: number
  unit_price: number
  total_value: number
  total_closed_value: number | null
  ton_condition: string | null
  packaging_size: string | null
  payment_method: string
  payment_term: string
  delivery_date: string | null
  status: string
  confirmation_token: string | null
  confirmation_expires_at: string | null
  confirmed_at: string | null
  divergence_note: string | null
  created_at: string
  updated_at: string
}

const defaultCrops = [
  { id: "cebola", name: "Cebola", default_unit: "saco" },
  { id: "tomate", name: "Tomate", default_unit: "caixa" },
  { id: "beterraba", name: "Beterraba", default_unit: "kg" },
  { id: "cenoura", name: "Cenoura", default_unit: "kg" },
]

async function read<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function write(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

function hashPassword(password: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < password.length; i++) {
    h1 = Math.imul(h1 ^ password.charCodeAt(i), 16777619)
    h2 = Math.imul(h2 ^ password.charCodeAt(password.length - 1 - i), 16777619)
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12)
}

function genToken(): string {
  return genId() + genId()
}

async function currentUserId(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const sessions = await read<StoredSession[]>(SESSIONS_KEY, [])
  const session = sessions.find((s) => s.token === token)
  return session?.user_id ?? null
}

export const api = {
  auth: {
    async signUp(params: { email: string; password: string; fullName: string; phone: string }) {
      const users = await read<StoredUser[]>(USERS_KEY, [])
      const email = params.email.trim().toLowerCase()
      if (users.some((u) => u.email === email)) throw new Error("E-mail já cadastrado")

      const user: StoredUser = {
        id: genId(),
        email,
        password: hashPassword(params.password),
        full_name: params.fullName,
        phone: params.phone,
        created_at: new Date().toISOString(),
      }
      users.push(user)
      await write(USERS_KEY, users)

      const { password: _pw, ...publicUser } = user
      return { user: publicUser, session: null }
    },

    async signIn(params: { email: string; password: string }) {
      const users = await read<StoredUser[]>(USERS_KEY, [])
      const email = params.email.trim().toLowerCase()
      const user = users.find((u) => u.email === email)
      if (!user || user.password !== hashPassword(params.password)) {
        throw new Error("E-mail ou senha inválidos")
      }

      const session: StoredSession = { token: genToken(), user_id: user.id, created_at: new Date().toISOString() }
      const sessions = await read<StoredSession[]>(SESSIONS_KEY, [])
      sessions.push(session)
      await write(SESSIONS_KEY, sessions)
      await AsyncStorage.setItem(TOKEN_KEY, session.token)

      const { password: _pw, ...publicUser } = user
      return { user: publicUser, session: { access_token: session.token } }
    },

    async getUser() {
      const userId = await currentUserId()
      if (!userId) return { user: null }
      const users = await read<StoredUser[]>(USERS_KEY, [])
      const user = users.find((u) => u.id === userId)
      if (!user) return { user: null }
      const { password: _pw, ...publicUser } = user
      return { user: publicUser }
    },

    async signOut() {
      await AsyncStorage.removeItem(TOKEN_KEY)
    },
  },

  contracts: {
    async list() {
      const userId = await currentUserId()
      const contracts = await read<StoredContract[]>(CONTRACTS_KEY, [])
      const crops = await read<typeof defaultCrops>(CROPS_KEY, defaultCrops)
      return contracts
        .filter((c) => c.seller_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((c) => {
          const crop = crops.find((ct) => ct.id === c.crop_type_id)
          return { ...c, crop_types: crop ? { name: crop.name } : null }
        })
    },

    async create(data: Record<string, unknown>) {
      const userId = await currentUserId()
      if (!userId) return null
      const now = new Date().toISOString()
      const contract: StoredContract = {
        id: genId(),
        seller_id: userId,
        seller_name: "",
        seller_document: null,
        seller_contact: null,
        status: "rascunho",
        confirmation_token: null,
        confirmation_expires_at: null,
        confirmed_at: null,
        divergence_note: null,
        created_at: now,
        updated_at: now,
        ...(data as Partial<StoredContract>),
      } as StoredContract
      const contracts = await read<StoredContract[]>(CONTRACTS_KEY, [])
      contracts.push(contract)
      await write(CONTRACTS_KEY, contracts)
      return contract
    },

    async get(id: string) {
      const contracts = await read<StoredContract[]>(CONTRACTS_KEY, [])
      const crops = await read<typeof defaultCrops>(CROPS_KEY, defaultCrops)
      const contract = contracts.find((c) => c.id === id)
      if (!contract) return null
      const crop = crops.find((ct) => ct.id === contract.crop_type_id)
      return { ...contract, crop_types: crop ? { name: crop.name } : null }
    },

    async send(id: string) {
      const contracts = await read<StoredContract[]>(CONTRACTS_KEY, [])
      const index = contracts.findIndex((c) => c.id === id)
      if (index === -1) throw new Error("Contrato não encontrado")

      const token = genToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      contracts[index] = {
        ...contracts[index],
        status: "aguardando_confirmacao",
        confirmation_token: token,
        confirmation_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }
      await write(CONTRACTS_KEY, contracts)
      return { token, expiresAt }
    },
  },

  cropTypes: {
    async list() {
      const crops = await read<typeof defaultCrops>(CROPS_KEY, defaultCrops)
      if (!(await AsyncStorage.getItem(CROPS_KEY))) {
        await write(CROPS_KEY, crops)
      }
      return crops
    },
  },

  public: {
    async getContract(token: string) {
      const contracts = await read<StoredContract[]>(CONTRACTS_KEY, [])
      const crops = await read<typeof defaultCrops>(CROPS_KEY, defaultCrops)
      const contract = contracts.find((c) => c.confirmation_token === token)
      if (!contract) throw new Error("Contrato não encontrado ou link inválido")
      const crop = crops.find((ct) => ct.id === contract.crop_type_id)
      return { ...contract, crop_types: crop ? { name: crop.name } : null }
    },

    async confirm(token: string) {
      const contracts = await read<StoredContract[]>(CONTRACTS_KEY, [])
      const index = contracts.findIndex((c) => c.confirmation_token === token)
      if (index === -1) throw new Error("Contrato não encontrado")
      contracts[index] = {
        ...contracts[index],
        status: "confirmado",
        confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      await write(CONTRACTS_KEY, contracts)
      return contracts[index]
    },

    async divergence(token: string, note: string) {
      const contracts = await read<StoredContract[]>(CONTRACTS_KEY, [])
      const index = contracts.findIndex((c) => c.confirmation_token === token)
      if (index === -1) throw new Error("Contrato não encontrado")
      contracts[index] = {
        ...contracts[index],
        status: "divergencia",
        divergence_note: note,
        updated_at: new Date().toISOString(),
      }
      await write(CONTRACTS_KEY, contracts)
      return contracts[index]
    },
  },
}