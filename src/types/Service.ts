import { TMiniWidget } from "@/types/Widget";

export type TService = {
  id?: number;
  title: string;
  slug: string;
  icon: string;
  widgets: TMiniWidget[];
}