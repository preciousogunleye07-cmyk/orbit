export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'data' | 'development' | 'design' | 'ai' | 'creative' | 'media';
  duration: string;
  level: string;
  schedule: string;
  badge?: string;
  iconName: string;
  curriculum: string[];
  careerOutcomes: string[];
  priceFormatted: string;
  imageUrl?: string;
}

export interface WorkspacePlan {
  id: string;
  name: string;
  price: number;
  period: 'day' | 'week' | 'month';
  formattedPrice: string;
  features: string[];
  recommended?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  courseOrProgram: string;
  content: string;
  avatar: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'courses' | 'siwes' | 'workspace' | 'general';
}

export type PaymentChannel = 'bank_transfer' | 'card' | 'ussd' | 'pos_qr';

export interface MoniepointPaymentRequest {
  title: string;
  subtitle: string;
  itemType: 'course' | 'workspace' | 'siwes' | 'service';
  itemId: string;
  amount: number;
  formattedAmount: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  meta?: Record<string, string>;
}

export interface MoniepointTransactionRecord {
  reference: string;
  apiKeyPrefix: string;
  amount: number;
  currency: string;
  payerName: string;
  payerEmail?: string;
  payerPhone: string;
  itemTitle: string;
  itemType: string;
  channel: PaymentChannel;
  status: 'successful' | 'pending' | 'failed';
  paidAt: string;
  moniepointTerminal: string;
  moniepointSessionId: string;
}

export type ActiveModal = 
  | { type: 'enroll'; course?: Course }
  | { type: 'siwes' }
  | { type: 'workspace'; planId?: string }
  | { type: 'about' }
  | { type: 'contact' }
  | { type: 'course-detail'; course: Course }
  | { type: 'moniepoint-checkout'; payment: MoniepointPaymentRequest }
  | null;
