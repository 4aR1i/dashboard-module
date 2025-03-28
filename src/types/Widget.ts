export type TWidget = {
  id: number;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  slide: {
    id: number;
    title: string;
  };
  component: string;
  params: {
    link: string;
    icon: string;
  };
};

export type TMiniWidget = Omit<TWidget, "id" | "x" | "y" | "slide">;
