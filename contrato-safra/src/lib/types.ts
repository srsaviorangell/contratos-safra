export type ContractStatus = "rascunho" | "aguardando_confirmacao" | "confirmado" | "divergencia" | "expirado"

export interface CropType {
  id: string
  name: string
  default_unit: string
  description: string | null
  is_active: boolean
}

export interface Contract {
  id: string
  seller_id: string
  seller_name: string
  seller_document: string | null
  seller_contact: string | null
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
  buyer_name: string
  buyer_document: string | null
  buyer_contact: string | null
  status: ContractStatus
  confirmation_token: string | null
  confirmation_expires_at: string | null
  confirmed_at: string | null
  divergence_note: string | null
  parent_contract_id: string | null
  verification_hash: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
  crop_types?: Pick<CropType, "name"> | null
}

export interface Profile {
  id: string
  full_name: string
  phone: string
  region: string | null
  created_at: string
}

export interface SellerFormData {
  seller_name: string
  seller_document: string
  seller_contact: string
  buyer_name: string
  buyer_document: string
  buyer_contact: string
  crop_type_id: string
  crop_type_custom: string
  unit_type: string
  quantity: string
  unit_price: string
  total_closed_value: string
  ton_condition: string
  packaging_size: string
  payment_method: string
  payment_term: string
  delivery_date: string
}
