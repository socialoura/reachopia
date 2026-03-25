export interface OrderPayload {
  orderId: string;
  email: string;
  username: string;
  platform: "instagram" | "tiktok";
  service: string;
  quantity: string;
  price: number;
  currency?: string;
}
